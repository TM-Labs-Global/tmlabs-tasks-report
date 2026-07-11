'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import {
  Folder,
  ListTodo,
  Plus,
  ChevronRight,
  ChevronDown,
  Settings2,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function WorkspacePage() {
  const { spaces, tasks, refreshData } = useWorkspace();
  const { user } = useAuth();
  const role = user?.role || 'staff';

  // Only Product Managers can access workspace management
  if (role !== 'product_manager') {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="mx-auto text-brand-pink w-12 h-12" />
        <h3 className="text-h3 font-bold text-primary">Access Restricted</h3>
        <p className="text-body text-secondary">Only Product Managers can access Workspace management. Please navigate to an allowed section.</p>
      </div>
    );
  }

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('#FF3396');
  const [newSpaceIcon, setNewSpaceIcon] = useState('📁');
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({});

  const toggleSpace = (id: string) => {
    setExpandedSpaces(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName) return;

    try {
      const res = await fetch('/api/workspace/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSpaceName,
          color: newSpaceColor,
          icon: newSpaceIcon
        }),
      });

      if (res.ok) {
        setNewSpaceName('');
        setIsCreateOpen(false);
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to count tasks in a list
  const getListTaskStats = (listId: string) => {
    const listTasks = tasks.filter(t => t.list_id === listId);
    const open = listTasks.filter(t => t.status_type !== 'closed').length;
    const overdue = listTasks.filter(t => t.flags?.isOverdue).length;
    return { open, overdue };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-navy-2 to-brand-navy p-6 rounded-2xl border border-slate-700/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-pink animate-pulse" />
            <span className="text-caption font-bold text-brand-pink uppercase tracking-widest">Workspace Management</span>
          </div>
          <h1 className="text-h1 font-bold text-primary tracking-tight">Spaces & Projects</h1>
          <p className="text-body text-secondary max-w-xl">
            Configure spaces, folders, and lists to structure your product deliveries and project workstream.
          </p>
        </div>

        {role === 'product_manager' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl shadow-lg shadow-brand-pink/20 gap-2 cursor-pointer font-bold">
                <Plus size={16} /> New Space
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-slate-700/30 text-primary rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-primary">Create Workspace Space</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSpace} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="spaceName" className="text-caption text-secondary font-semibold">Space Name</Label>
                  <Input 
                    id="spaceName" 
                    placeholder="e.g. Product Development" 
                    value={newSpaceName}
                    onChange={e => setNewSpaceName(e.target.value)}
                    className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="spaceIcon" className="text-caption text-secondary font-semibold">Emoji Icon</Label>
                    <Input 
                      id="spaceIcon" 
                      value={newSpaceIcon}
                      onChange={e => setNewSpaceIcon(e.target.value)}
                      className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="spaceColor" className="text-caption text-secondary font-semibold">Hex Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="spaceColor" 
                        type="color"
                        value={newSpaceColor}
                        onChange={e => setNewSpaceColor(e.target.value)}
                        className="w-10 h-10 p-0.5 bg-secondary border-slate-700/50 rounded-xl cursor-pointer"
                      />
                      <Input 
                        value={newSpaceColor}
                        onChange={e => setNewSpaceColor(e.target.value)}
                        className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20 flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-slate-700/50 text-secondary hover:bg-elevated hover:text-primary cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer font-bold">
                    Create Space
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spaces.map(space => {
          const isExpanded = expandedSpaces[space.id] ?? true;
          return (
            <Card key={space.id} className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden hover:border-slate-700/40 transition-all">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-slate-700/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" style={{ textShadow: `0 0 10px ${space.color}40` }}>{space.icon}</span>
                  <div>
                    <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
                      {space.name}
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: space.color }} />
                    </CardTitle>
                    <CardDescription className="text-caption text-secondary">
                      {space.folders?.length || 0} folders • {(space.folderlessLists?.length || 0) + (space.folders?.reduce((acc: number, f: any) => acc + (f.lists?.length || 0), 0) || 0)} lists
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleSpace(space.id)}
                    className="text-secondary hover:text-primary rounded-xl cursor-pointer"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-5 space-y-4">
                  {/* Folders */}
                  {space.folders?.map((folder: any) => (
                    <div key={folder.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-caption text-primary font-bold px-1.5 py-1 bg-elevated/40 rounded-lg border border-slate-700/10">
                        <Folder size={14} className="text-brand-purple" />
                        <span>{folder.name}</span>
                      </div>
                      <div className="pl-4 space-y-1.5 border-l border-slate-700/10 ml-3">
                        {folder.lists?.map((list: any) => {
                          const stats = getListTaskStats(list.id);
                          return (
                            <Link 
                              key={list.id} 
                              href={`/workspace/${list.id}`}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-elevated/50 group transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <ListTodo size={14} className="text-secondary group-hover:text-brand-pink transition-colors" />
                                <span className="text-caption font-medium text-secondary group-hover:text-primary transition-colors">{list.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted bg-elevated px-2 py-0.5 rounded-full">
                                  {stats.open} open
                                </span>
                                {stats.overdue > 0 && (
                                  <span className="text-[10px] font-bold text-white bg-brand-pink/20 border border-brand-pink/30 px-2 py-0.5 rounded-full">
                                    {stats.overdue} overdue
                                  </span>
                                )}
                                <ArrowRight size={12} className="text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-[-4px] group-hover:translate-x-0" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Folderless Lists */}
                  {space.folderlessLists?.map((list: any) => {
                    const stats = getListTaskStats(list.id);
                    return (
                      <Link 
                        key={list.id} 
                        href={`/workspace/${list.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-elevated/20 border border-slate-700/5 hover:bg-elevated/50 group transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <ListTodo size={14} className="text-secondary group-hover:text-brand-pink transition-colors" />
                          <span className="text-caption font-medium text-secondary group-hover:text-primary transition-colors">{list.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted bg-elevated px-2 py-0.5 rounded-full">
                            {stats.open} open
                          </span>
                          {stats.overdue > 0 && (
                            <span className="text-[10px] font-bold text-white bg-brand-pink/20 border border-brand-pink/30 px-2 py-0.5 rounded-full">
                              {stats.overdue} overdue
                            </span>
                          )}
                          <ArrowRight size={12} className="text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-[-4px] group-hover:translate-x-0" />
                        </div>
                      </Link>
                    );
                  })}

                  {space.folders?.length === 0 && space.folderlessLists?.length === 0 && (
                    <div className="text-center py-6 text-caption text-muted border border-dashed border-slate-700/10 rounded-xl">
                      No lists configured in this space.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
