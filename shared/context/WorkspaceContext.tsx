'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WorkspaceContextType {
  spaces: any[];
  tasks: any[];
  members: any[];
  isLoading: boolean;
  isConfigured: boolean;
  refreshData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const normalizeSupabaseTask = useCallback((dbTask: any) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const dueDateMs = dbTask.due_date ? new Date(dbTask.due_date).getTime() : null;
    const statusName = typeof dbTask.status === 'object' && dbTask.status ? (dbTask.status.name || 'todo') : (dbTask.status || 'todo');
    const statusType = typeof dbTask.status === 'object' && dbTask.status ? (dbTask.status.type || 'open') : (dbTask.status_type || 'open');
    const isClosed = statusType === 'closed' || statusName.toLowerCase().includes('complete') || statusName.toLowerCase().includes('done') || statusName.toLowerCase().includes('closed');

    let priorityId: 1 | 2 | 3 | 4 | null = null;
    if (dbTask.priority === 'urgent' || dbTask.priority === 1 || dbTask.priority === '1') priorityId = 1;
    else if (dbTask.priority === 'high' || dbTask.priority === 2 || dbTask.priority === '2') priorityId = 2;
    else if (dbTask.priority === 'normal' || dbTask.priority === 3 || dbTask.priority === '3') priorityId = 3;
    else if (dbTask.priority === 'low' || dbTask.priority === 4 || dbTask.priority === '4') priorityId = 4;

    const resolvedAssignees = (dbTask.assignees || []).map((a: any) => {
      const profile = a.profile || a.user || a;
      return {
        id: profile.id || profile._id || a.id || a.user_id,
        username: profile.full_name || profile.name || profile.username || profile.email?.split('@')[0] || a.username || 'User',
        email: profile.email || a.email,
        profilePicture: profile.avatar_url || profile.profilePicture || profile.avatar || a.avatar_url
      };
    });

    const resolvedTags = (dbTask.tags || []).map((t: any) => ({
      name: t.tag?.name || t.name || String(t),
      color: t.tag?.color || t.color || '#3B82F6'
    }));

    let dateClosedMs: number | null = null;
    if (dbTask.date_closed) {
      if (typeof dbTask.date_closed === 'number') {
        dateClosedMs = dbTask.date_closed;
      } else if (typeof dbTask.date_closed === 'string') {
        if (/^\d+$/.test(dbTask.date_closed)) {
          dateClosedMs = parseInt(dbTask.date_closed, 10);
        } else {
          const parsed = new Date(dbTask.date_closed).getTime();
          dateClosedMs = isNaN(parsed) ? null : parsed;
        }
      }
    }

    return {
      ...dbTask,
      id: dbTask.id || dbTask._id,
      name: dbTask.name || 'Untitled Task',
      status: statusName,
      status_type: statusType,
      priority: priorityId,
      project: dbTask.list?.name || dbTask.list_name || dbTask.project || 'General Tasks',
      dueDate: dbTask.due_date ? new Date(dbTask.due_date).toLocaleDateString() : null,
      assignee: resolvedAssignees[0] ? {
        name: resolvedAssignees[0].username,
        avatar: resolvedAssignees[0].profilePicture
      } : undefined,
      assignees: resolvedAssignees,
      text_content: dbTask.description || '',
      url: `/tasks/${dbTask.id || dbTask._id}`,
      tags: resolvedTags,
      flags: {
        isBlocked: statusType === 'blocked' || statusName.toLowerCase().includes('blocked'),
        isOverdue: dueDateMs && dueDateMs < now && !isClosed,
        isSpillover: dueDateMs && dueDateMs < now && dueDateMs > weekAgo && !isClosed,
      },
      start_date: dbTask.start_date ? new Date(dbTask.start_date).getTime() : null,
      due_date_raw: dueDateMs,
      date_closed: dateClosedMs ? String(dateClosedMs) : null
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workspace/data');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setSpaces(data.spaces || []);

        const normalized = (data.tasks || []).map(normalizeSupabaseTask);
        setTasks(normalized);
      }
    } catch (err) {
      console.error('WorkspaceContext fetchData error:', err);
    } finally {
      setIsConfigured(true);
      setIsLoading(false);
    }
  }, [normalizeSupabaseTask]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Automatic background polling every 15 seconds for live team sync
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/workspace/data')
        .then(res => {
          if (!res.ok) return null;
          return res.json();
        })
        .then(data => {
          if (data) {
            if (data.members) setMembers(data.members);
            if (data.spaces) setSpaces(data.spaces);
            if (data.tasks) {
              const normalized = data.tasks.map(normalizeSupabaseTask);
              setTasks(normalized);
            }
          }
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [normalizeSupabaseTask]);

  return (
    <WorkspaceContext.Provider value={{
      spaces,
      tasks,
      members,
      isLoading,
      isConfigured,
      refreshData,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
