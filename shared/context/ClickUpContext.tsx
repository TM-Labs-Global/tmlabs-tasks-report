'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as ClickUpAPI from '@/shared/api/clickup';
import { mapAssignees } from '@/shared/utils/userMapping';

interface ClickUpContextType {
  token: string | null;
  setToken: (token: string) => void;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  tasks: any[];
  members: any[];
  teams: any[];
  spaces: any[];
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string) => void;
  refreshData: () => Promise<void>;
}

const ClickUpContext = createContext<ClickUpContextType | undefined>(undefined);

export function ClickUpProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('clickup_token');
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('clickup_token', newToken);
  };

  const normalizeTasks = (rawTasks: any[], teamMembers: any[]) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return rawTasks.map(task => {
      const dueDate = task.due_date ? parseInt(task.due_date) : null;
      const isClosed = task.status?.type === 'closed' || task.status?.status === 'complete';
      
      const mappedAssignees = mapAssignees(task.assignees, teamMembers);
      
      return {
        ...task,
        assignees: mappedAssignees,
        id: task.id,
        name: task.name,
        status: task.status?.status || 'todo',
        priority: task.priority?.id ? parseInt(task.priority.id) as 1|2|3|4 : null,
        project: task.list?.name || 'No List',
        dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : null,
        assignee: mappedAssignees?.[0] ? {
          name: mappedAssignees[0].username,
          avatar: mappedAssignees[0].profilePicture
        } : undefined,
        text_content: task.description || task.text_content,
        url: task.url,
        tags: task.tags || [],
        flags: {
          isBlocked: task.status?.status.toLowerCase().includes('blocked'),
          isOverdue: dueDate && dueDate < now && !isClosed,
          isSpillover: dueDate && dueDate < now && dueDate > weekAgo && !isClosed,
        },
        start_date: task.start_date ? parseInt(task.start_date) : null,
        due_date_raw: dueDate
      };
    });
  };

  const fetchData = useCallback(async (tokenToUse: string | null, teamId: string, teamMembers: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all raw tasks across the team
      const rawTasks = await ClickUpAPI.getAllTasks(teamId, tokenToUse || '');
      
      // 2. Deduplicate tasks by task.id before calculations
      const uniqueTasksMap = new Map();
      rawTasks.forEach(task => {
        if (task && task.id) {
          uniqueTasksMap.set(task.id, task);
        }
      });
      const uniqueTasks = Array.from(uniqueTasksMap.values());
      
      setTasks(normalizeTasks(uniqueTasks, teamMembers));
      setMembers(teamMembers || []);

      // 3. Fetch spaces and their lists (both Folder Lists and folderless lists)
      const detailedSpaces = await ClickUpAPI.getWorkspaceHierarchy(teamId, tokenToUse || '');
      setSpaces(detailedSpaces);

      setIsConfigured(true);
    } catch (err: any) {
      console.error('Fetch Data Error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = async () => {
    if (selectedTeamId) {
      const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
      await fetchData(token, selectedTeamId, currentTeam?.members || []);
    }
  };

  // Initialize workspace
  useEffect(() => {
    const initWorkspace = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const teamsData = await ClickUpAPI.getTeams(token || '');
        const teamsList: any[] = teamsData.teams || [];
        setTeams(teamsList);
        
        const selectedTeam = teamsList[0];
        
        if (selectedTeam) {
          setSelectedTeamId(selectedTeam.id);
          await fetchData(token, selectedTeam.id, selectedTeam.members || []);
        } else {
          setIsConfigured(false);
          // Don't throw error if token is null, just show setup screen
          if (token) throw new Error('No ClickUp Workspace found for this token.');
        }
      } catch (err: any) {
        console.error('ClickUp Init Error:', err);
        setError(err.message || 'Failed to connect to ClickUp. Check your API token.');
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    initWorkspace();
  }, [token, fetchData]);

  // Automated live-sync
  useEffect(() => {
    if (!isConfigured || isLoading) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isConfigured, refreshData, isLoading]);

  return (
    <ClickUpContext.Provider value={{ 
      token, 
      setToken, 
      isLoading, 
      isConfigured,
      error, 
      tasks, 
      members, 
      teams, 
      spaces,
      selectedTeamId, 
      setSelectedTeamId,
      refreshData
    }}>
      {children}
    </ClickUpContext.Provider>
  );
}

export function useClickUp() {
  const context = useContext(ClickUpContext);
  if (context === undefined) {
    throw new Error('useClickUp must be used within a ClickUpProvider');
  }
  return context;
}
