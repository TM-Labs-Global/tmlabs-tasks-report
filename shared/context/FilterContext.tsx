'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Filters {
  status: string[];
  priority: string[];
  member: string[];
  project: string[];
  search: string;
  startDate: string | null;
  endDate: string | null;
}

interface FilterContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  isFiltered: boolean;
}

export const getDefaultDateRange = () => {
  const now = new Date();
  const day = now.getDay();
  // Monday is day 1. If day is 0 (Sunday), we subtract 6 days. Otherwise we subtract (day - 1) days.
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return {
    start: monday.toISOString(),
    end: today.toISOString(),
  };
};

const initialFilters: Filters = {
  status: [],
  priority: [],
  member: [],
  project: [],
  search: '',
  startDate: null,
  endDate: null,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const resetFilters = () => setFilters(initialFilters);


  const isFiltered = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.member.length > 0 || 
    filters.project.length > 0 || 
    filters.search !== '' ||
    filters.startDate !== null ||
    filters.endDate !== null;


  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters, isFiltered }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
