'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { ListView } from '@/features/tasks/ListView';
import { BoardView } from '@/features/tasks/BoardView';
import { TaskDetailPanel } from '@/features/tasks/TaskDetailPanel';
import { Sheet } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.listId as string;
  const { spaces, tasks, refreshData, isLoading, members } = useWorkspace();


  const [activeTab, setActiveTab] = useState('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Restore active view type tab from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`list_view_tab_${listId}`);
    if (saved) setActiveTab(saved);
  }, [listId]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    localStorage.setItem(`list_view_tab_${listId}`, val);
  };

  // Find the list object and its custom statuses from workspace context
  let currentList: any = null;
  let spaceColor = '#6633FF';
  for (const space of spaces) {
    // Check space lists
    const foundList = space.folderlessLists?.find((l: any) => l.id === listId);
    if (foundList) {
      currentList = foundList;
      spaceColor = space.color;
      break;
    }
    // Check folder lists
    for (const folder of space.folders || []) {
      const foundFolderList = folder.lists?.find((l: any) => l.id === listId);
      if (foundFolderList) {
        currentList = foundFolderList;
        spaceColor = space.color;
        break;
      }
    }
  }

  const listTasks = tasks.filter(t => t.list_id === listId);
  const statuses = currentList?.statuses || [];

  const handleUpdateStatus = async (taskId: string, statusId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: statusId }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (taskName: string, statusId?: string) => {
    const defaultStatusId = statusId || statuses[0]?.id;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: listId,
          name: taskName,
          status_id: defaultStatusId,
          priority: 'normal'
        }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
        <p className="text-body text-secondary animate-pulse">Loading list workspace...</p>
      </div>
    );
  }

  if (!currentList) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <h3 className="text-h3 font-bold text-primary">Workspace list not found</h3>
        <p className="text-body text-secondary">The requested list does not exist or you do not have permission to view it.</p>
        <Link href="/workspace" className="text-brand-pink font-semibold hover:underline">
          Return to Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 text-left">
          <Link 
            href="/workspace" 
            className="flex items-center gap-1.5 text-caption font-bold text-secondary hover:text-brand-pink transition-colors mb-2 cursor-pointer w-fit"
          >
            <ArrowLeft size={14} /> Back to Workspace
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-primary tracking-tight">{currentList.name}</h1>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: spaceColor }} />
          </div>
        </div>

        {/* View selection tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList className="bg-secondary/50 border border-slate-700/20 rounded-xl p-1">
            <TabsTrigger value="list" className="rounded-lg text-caption font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary">List View</TabsTrigger>
            <TabsTrigger value="board" className="rounded-lg text-caption font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary">Kanban Board</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'list' ? (
          <ListView 
            listId={listId}
            tasks={listTasks}
            statuses={statuses}
            members={members}
            onTaskClick={setSelectedTaskId}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        ) : (
          <BoardView 
            tasks={listTasks}
            statuses={statuses}
            onTaskClick={setSelectedTaskId}
            onUpdateStatus={handleUpdateStatus}
            onAddTaskInStatus={(statusId) => {
              const name = prompt('Enter task name:');
              if (name) handleAddTask(name, statusId);
            }}
          />
        )}
      </div>

      {/* Task Detail Slide-over Sheet */}
      <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        {selectedTaskId && (
          <TaskDetailPanel 
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onRefresh={refreshData}
          />
        )}
      </Sheet>
    </div>
  );
}
