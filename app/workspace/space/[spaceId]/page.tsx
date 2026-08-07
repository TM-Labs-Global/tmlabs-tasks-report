'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  ListTodo,
  Plus,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{ borderColor: `${color}22` }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-[22px] font-bold text-primary leading-none">{value}</div>
        <div className="text-[11px] text-muted font-semibold mt-0.5 uppercase tracking-wide">{label}</div>
        {sub && <div className="text-[10px] text-muted/70">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Folder Card ─────────────────────────────────────────────────────────────
function FolderCard({
  folder,
  tasks,
}: {
  folder: any;
  tasks: any[];
}) {
  const folderTasks = tasks.filter((t) => folder.lists?.some((l: any) => l.id === t.list_id));
  const openTasks = folderTasks.filter((t) => t.status_type !== 'closed').length;
  const doneTasks = folderTasks.filter((t) => t.status_type === 'closed').length;
  const overdueTasks = folderTasks.filter((t) => t.flags?.isOverdue).length;
  const total = folderTasks.length;
  const pct = total > 0 ? Math.round((doneTasks / total) * 100) : 0;

  return (
    <Link
      href={`/workspace/folder/${folder.id}`}
      className="group block bg-card border border-border rounded-xl p-4 hover:border-brand-purple/40 hover:shadow-lg hover:shadow-brand-purple/5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${folder.color || '#6633FF'}20`, border: `1px solid ${folder.color || '#6633FF'}40` }}
          >
            <Folder size={15} style={{ color: folder.color || '#6633FF' }} />
          </div>
          <div>
            <div className="font-bold text-primary text-[13.5px] group-hover:text-brand-purple transition-colors leading-tight">
              {folder.name}
            </div>
            <div className="text-[11px] text-muted mt-0.5">
              {folder.lists?.length || 0} list{folder.lists?.length !== 1 ? 's' : ''} · {total} task{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <ArrowRight
          size={14}
          className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0"
        />
      </div>

      {/* Completion bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted mb-1">
          <span>Completion</span>
          <span style={{ color: pct === 100 ? '#22C55E' : 'inherit' }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#22C55E' : 'linear-gradient(to right, #6633FF, #FF3396)',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] font-semibold">
        <span className="text-muted">{openTasks} open</span>
        {overdueTasks > 0 && (
          <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">
            {overdueTasks} overdue
          </span>
        )}
        {doneTasks > 0 && (
          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            {doneTasks} done
          </span>
        )}
      </div>

      {/* List chips */}
      {folder.lists && folder.lists.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-1.5">
          {folder.lists.slice(0, 4).map((list: any) => (
            <span
              key={list.id}
              className="text-[10px] font-medium text-muted bg-elevated px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <ListTodo size={9} />
              {list.name}
            </span>
          ))}
          {folder.lists.length > 4 && (
            <span className="text-[10px] font-medium text-muted bg-elevated px-2 py-0.5 rounded-full">
              +{folder.lists.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ─── List Row (folderless lists) ─────────────────────────────────────────────
function ListRow({ list, tasks }: { list: any; tasks: any[] }) {
  const listTasks = tasks.filter((t) => t.list_id === list.id);
  const open = listTasks.filter((t) => t.status_type !== 'closed').length;
  const overdue = listTasks.filter((t) => t.flags?.isOverdue).length;

  return (
    <Link
      href={`/workspace/${list.id}`}
      className="group flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl hover:border-brand-pink/40 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-pink/10 border border-brand-pink/20 flex-shrink-0">
          <ListTodo size={13} className="text-brand-pink" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-primary group-hover:text-brand-pink transition-colors">
            {list.name}
          </div>
          <div className="text-[11px] text-muted">{listTasks.length} tasks</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {open > 0 && (
          <span className="text-[10px] font-bold text-muted bg-elevated px-2 py-0.5 rounded-full">{open} open</span>
        )}
        {overdue > 0 && (
          <span className="text-[10px] font-bold text-white bg-brand-pink/20 border border-brand-pink/30 px-2 py-0.5 rounded-full">
            {overdue} overdue
          </span>
        )}
        <ArrowRight size={13} className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SpaceOverviewPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const router = useRouter();
  const { spaces, tasks, refreshData } = useWorkspace();
  const { user } = useAuth();
  const role = user?.role || 'staff';

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#6633FF');
  const [listName, setListName] = useState('');
  const [saving, setSaving] = useState(false);

  const space = useMemo(() => (spaces || []).find((s: any) => s.id === spaceId), [spaces, spaceId]);

  if (!space) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        <AlertCircle size={18} className="mr-2 text-brand-pink" />
        Space not found. <Link href="/workspace" className="ml-1 text-brand-pink underline">Go back</Link>
      </div>
    );
  }

  // ── Metrics ────────────────────────────────────────────────────────────────
  const allListIds = [
    ...(space.folderlessLists || []).map((l: any) => l.id),
    ...(space.folders || []).flatMap((f: any) => (f.lists || []).map((l: any) => l.id)),
  ];
  const spaceTasks = tasks.filter((t) => allListIds.includes(t.list_id));
  const totalTasks = spaceTasks.length;
  const openTasks = spaceTasks.filter((t) => t.status_type !== 'closed').length;
  const doneTasks = spaceTasks.filter((t) => t.status_type === 'closed').length;
  const overdueTasks = spaceTasks.filter((t) => t.flags?.isOverdue).length;
  const inProgress = spaceTasks.filter((t) => t.status_type === 'in_progress').length;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/workspace/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId, name: folderName.trim(), color: folderColor }),
      });
      if (res.ok) {
        setFolderName('');
        setFolderColor('#6633FF');
        setShowCreateFolder(false);
        refreshData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/workspace/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId, name: listName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setListName('');
        setShowCreateList(false);
        refreshData();
        router.push(`/workspace/${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-muted">
        <Link href="/workspace" className="hover:text-primary transition-colors">Workspace</Link>
        <ChevronRight size={12} />
        <span className="text-primary font-semibold">{space.name}</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${space.color}15 0%, var(--bg-card) 60%)`,
          borderColor: `${space.color}30`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: space.color }}
        />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0"
              style={{ background: `${space.color}25`, border: `1.5px solid ${space.color}50` }}
            >
              {space.icon || '📁'}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: space.color }}>
                Space Overview
              </div>
              <h1 className="text-[22px] font-extrabold text-primary leading-none">{space.name}</h1>
              <p className="text-muted text-[13px] mt-1">
                {space.folders?.length || 0} folders · {allListIds.length} lists · {totalTasks} tasks
              </p>
            </div>
          </div>

          {role === 'product_manager' && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={() => setShowCreateFolder(true)}
                size="sm"
                className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg gap-1.5 text-[12px] font-bold shadow-lg shadow-brand-purple/20 cursor-pointer"
              >
                <FolderPlus size={14} /> New Folder
              </Button>
              <Button
                onClick={() => setShowCreateList(true)}
                size="sm"
                className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-lg gap-1.5 text-[12px] font-bold shadow-lg shadow-brand-pink/20 cursor-pointer"
              >
                <Plus size={14} /> New List
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Total Tasks" value={totalTasks} icon={Layers} color="#8A9CC8" />
        <MetricCard label="Open" value={openTasks} icon={Clock} color="#F59E0B" />
        <MetricCard label="In Progress" value={inProgress} icon={BarChart2} color="#6633FF" />
        <MetricCard label="Done" value={doneTasks} icon={CheckCircle2} color="#22C55E" />
        <MetricCard label="Overdue" value={overdueTasks} icon={AlertCircle} color="#FF3396" />
      </div>

      {/* ── Folders Grid ── */}
      {(space.folders || []).length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={15} className="text-brand-purple" />
            <h2 className="text-[13px] font-bold text-primary uppercase tracking-wide">
              Folders ({space.folders.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {space.folders.map((folder: any) => (
              <FolderCard key={folder.id} folder={folder} tasks={tasks} />
            ))}
          </div>
        </section>
      )}

      {/* ── Folderless Lists ── */}
      {(space.folderlessLists || []).length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={15} className="text-brand-pink" />
            <h2 className="text-[13px] font-bold text-primary uppercase tracking-wide">
              Direct Lists ({space.folderlessLists.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {space.folderlessLists.map((list: any) => (
              <ListRow key={list.id} list={list} tasks={tasks} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty State ── */}
      {(space.folders || []).length === 0 && (space.folderlessLists || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <FolderOpen size={36} className="mx-auto text-muted mb-3 opacity-50" />
          <p className="text-muted font-semibold">This space has no folders or lists yet.</p>
          {role === 'product_manager' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                onClick={() => setShowCreateFolder(true)}
                size="sm"
                className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg gap-1.5 text-[12px] cursor-pointer"
              >
                <FolderPlus size={13} /> Create Folder
              </Button>
              <Button
                onClick={() => setShowCreateList(true)}
                size="sm"
                variant="outline"
                className="rounded-lg gap-1.5 text-[12px] cursor-pointer"
              >
                <Plus size={13} /> Add List
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Create Folder Modal ── */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="bg-card border border-border text-primary rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Create Folder in {space.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted uppercase">Folder Name</Label>
              <Input
                autoFocus
                placeholder="e.g. GETLY APP"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="bg-elevated border-border text-primary rounded-xl focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted uppercase">Folder Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-elevated"
                />
                <Input
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="bg-elevated border-border text-primary rounded-xl flex-1"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateFolder(false)} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl cursor-pointer font-bold"
              >
                {saving ? 'Creating…' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Create List Modal ── */}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent className="bg-card border border-border text-primary rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Add List to {space.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted uppercase">List Name</Label>
              <Input
                autoFocus
                placeholder="e.g. Sprint Planning"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="bg-elevated border-border text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                required
              />
            </div>
            <p className="text-[11px] text-muted">
              A new list with default statuses (To Do, In Progress, In Review, Blocked, Done) will be created directly in this Space.
            </p>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateList(false)} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer font-bold"
              >
                {saving ? 'Creating…' : 'Create List'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
