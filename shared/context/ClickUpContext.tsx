'use client';

import React, { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

import { useWorkspace } from '@/shared/context/WorkspaceContext';

export function ClickUpProvider({ children }: { children: React.ReactNode }) {
  const ws = useWorkspace();

  const token = 'supabase_migration_active';
  const setToken = () => {};
  const error = null;
  const selectedTeamId = 'migrated_team';
  const setSelectedTeamId = () => {};

  return (
    <ClickUpContext.Provider value={{ 
      token, 
      setToken, 
      isLoading: ws.isLoading, 
      isConfigured: ws.isConfigured,
      error, 
      tasks: ws.tasks, 
      members: ws.members, 
      teams: [{ id: 'migrated_team', name: 'Tmlabs', members: ws.members }], 
      spaces: ws.spaces,
      selectedTeamId, 
      setSelectedTeamId,
      refreshData: ws.refreshData
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
