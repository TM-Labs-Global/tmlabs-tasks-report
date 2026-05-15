'use client';

import React from 'react';

interface ProjectProgress {
  name: string;
  total: number;
  completed: number;
  pct: number;
}

interface ProgressByProjectProps {
  projects: ProjectProgress[];
}

export function ProgressByProject({ projects }: ProgressByProjectProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="py-8 text-center bg-secondary/20 rounded-xl border border-dashed border-slate-700/20">
        <p className="text-caption text-muted italic">No active projects found.</p>
      </div>
    );
  }

  // Show top 5 projects by task count
  const displayProjects = [...projects].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="space-y-4">
      {displayProjects.map((project) => (
        <div key={project.name} className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="text-body font-medium text-primary truncate pr-4">
              {project.name}
            </div>
            <div className="text-caption text-secondary whitespace-nowrap">
              <span className="text-primary font-semibold">{project.completed}</span>
              <span className="mx-1">/</span>
              <span>{project.total} tasks</span>
              <span className="ml-2 font-bold text-brand-pink">{project.pct}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-pink to-brand-purple transition-all duration-500" 
              style={{ width: `${project.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
