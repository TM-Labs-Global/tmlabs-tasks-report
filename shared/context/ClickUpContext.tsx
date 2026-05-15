'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as ClickUpAPI from '@/shared/api/clickup';

interface ClickUpContextType {
  token: string | null;
  setToken: (token: string) => void;
  isLoading: boolean;
  error: string | null;
  tasks: any[];
  members: any[];
  teams: any[];
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string) => void;
  refreshData: () => Promise<void>;
}

const ClickUpContext = createContext<ClickUpContextType | undefined>(undefined);

export function ClickUpProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Initialize token from .env or localStorage
  useEffect(() => {
    const envToken = process.env.NEXT_PUBLIC_CLICKUP_API_TOKEN;
    const storedToken = localStorage.getItem('clickup_token');
    
    if (envToken) {
      setTokenState(envToken);
    } else if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('clickup_token', newToken);
  };

  const normalizeTasks = (rawTasks: any[]) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return rawTasks.map(task => {
      const dueDate = task.due_date ? parseInt(task.due_date) : null;
      const isClosed = task.status?.type === 'closed' || task.status?.status === 'complete';
      
      return {
        ...task,
        id: task.id,
        name: task.name,
        status: task.status?.status || 'todo',
        priority: task.priority?.id ? parseInt(task.priority.id) as 1|2|3|4 : null,
        project: task.list?.name || 'No List',
        dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : null,
        assignee: task.assignees?.[0] ? {
          name: task.assignees[0].username,
          avatar: task.assignees[0].profilePicture
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

  const fetchData = useCallback(async (tokenToUse: string, teamId: string, teamMembers: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawTasks = await ClickUpAPI.getAllTasks(teamId, tokenToUse);
      setTasks(normalizeTasks(rawTasks));
      setMembers(teamMembers || []);
    } catch (err: any) {
      console.error('Fetch Data Error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = async () => {
    if (token && selectedTeamId) {
      const currentTeam = teams.find((t: any) => t.id === selectedTeamId);
      await fetchData(token, selectedTeamId, currentTeam?.members || []);
    }

  };

  // When token changes, fetch teams
  useEffect(() => {
    if (!token) return;

    const initWorkspace = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const teamsData = await ClickUpAPI.getTeams(token);
        const teamsList: any[] = teamsData.teams || [];
        setTeams(teamsList);
        
        const envTeamId = process.env.NEXT_PUBLIC_CLICKUP_TEAM_ID;
        const selectedTeam = teamsList.find((t: any) => t.id === envTeamId) || teamsList[0];

        
        if (selectedTeam) {
          setSelectedTeamId(selectedTeam.id);
          await fetchData(token, selectedTeam.id, selectedTeam.members || []);
        } else {
          throw new Error('No ClickUp Workspace found for this token.');
        }
      } catch (err: any) {
        console.error('ClickUp Init Error:', err);
        setError(err.message || 'Failed to connect to ClickUp. Check your API token.');
      } finally {
        setIsLoading(false);
      }
    };

    initWorkspace();
  }, [token, fetchData]);

  // Automated live-sync (polling every 60 seconds)
  useEffect(() => {
    if (!token || !selectedTeamId || isLoading) return;
    
    const interval = setInterval(() => {
      console.log('Automated sync: Refreshing ClickUp data...');
      refreshData();
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [token, selectedTeamId, refreshData, isLoading]);

  return (
    <ClickUpContext.Provider value={{ 
      token, 
      setToken, 
      isLoading, 
      error, 
      tasks, 
      members, 
      teams, 
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
