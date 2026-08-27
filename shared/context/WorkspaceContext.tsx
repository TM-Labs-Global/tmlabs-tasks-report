'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';

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
    const isClosed = dbTask.status?.type === 'closed';

    let priorityId: 1 | 2 | 3 | 4 | null = null;
    if (dbTask.priority === 'urgent') priorityId = 1;
    else if (dbTask.priority === 'high') priorityId = 2;
    else if (dbTask.priority === 'normal') priorityId = 3;
    else if (dbTask.priority === 'low') priorityId = 4;

    const resolvedAssignees = (dbTask.assignees || []).map((a: any) => ({
      id: a.profile?.id,
      username: a.profile?.full_name || a.profile?.email?.split('@')[0],
      email: a.profile?.email,
      profilePicture: a.profile?.avatar_url
    }));

    const resolvedTags = (dbTask.tags || []).map((t: any) => ({
      name: t.tag?.name,
      color: t.tag?.color
    }));

    return {
      ...dbTask,
      id: dbTask.id,
      name: dbTask.name,
      status: dbTask.status?.name || 'todo',
      status_type: dbTask.status?.type || 'open',
      priority: priorityId,
      project: dbTask.list?.name || 'No List',
      dueDate: dbTask.due_date ? new Date(dbTask.due_date).toLocaleDateString() : null,
      assignee: resolvedAssignees[0] ? {
        name: resolvedAssignees[0].username,
        avatar: resolvedAssignees[0].profilePicture
      } : undefined,
      assignees: resolvedAssignees,
      text_content: dbTask.description || '',
      url: `/tasks/${dbTask.id}`,
      tags: resolvedTags,
      flags: {
        isBlocked: dbTask.status?.type === 'blocked' || dbTask.status?.name?.toLowerCase().includes('blocked'),
        isOverdue: dueDateMs && dueDateMs < now && !isClosed,
        isSpillover: dueDateMs && dueDateMs < now && dueDateMs > weekAgo && !isClosed,
      },
      start_date: dbTask.start_date ? new Date(dbTask.start_date).getTime() : null,
      due_date_raw: dueDateMs
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

  // Realtime subscription setup
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('workspace_realtime_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignees' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

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
