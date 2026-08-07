'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { useAuth } from '@/shared/context/AuthContext';
import {
  ChevronRight,
  ListTodo,
  Plus,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  List,
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
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
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
      </div>
    </div>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────
function ListCard({
  list,
  tasks,
  folderColor,
}: {
  list: any;
  tasks: any[];
  folderColor?: string;
}) {
  const listTasks = tasks.filter((t) => t.list_id === list.id);
  const total = listTasks.length;
  const open = listTasks.filter((t) => t.status_type !== 'closed').length;
  const done = listTasks.filter((t) => t.status_type === 'closed').length;
  const overdue = listTasks.filter((t) => t.flags?.isOverdue).length;
  const inReview = listTasks.filter((t) => t.status_type === 'review').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const accent = folderColor || '#FF3396';

  return (
    <Link
      href={`/workspace/${list.id}`}
      className="group block bg-card border border-border rounded-xl p-4 hover:border-brand-pink/40 hover:shadow-lg hover:shadow-brand-pink/5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
          >
            <ListTodo size={14} style={{ color: accent }} />
          </div>
          <div>
            <div className="font-bold text-primary text-[13.5px] group-hover:text-brand-pink transition-colors leading-tight">
              {list.name}
            </div>
            <div className="text-[11px] text-muted mt-0.5">{total} task{total !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <ArrowRight
          size={14}
          className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0"
        />
      </div>

      {/* Statuses breakdown */}
      {list.statuses && list.statuses.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {list.statuses.slice(0, 5).map((s: any) => {
            const count = listTasks.filter((t) => t.status?.id === s.id).length;
            return (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${s.color}18`,
                  color: s.color,
                  border: `1px solid ${s.color}35`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                {s.name} {count > 0 && <span className="opacity-70">({count})</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* Completion bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted mb-1">
          <span>Completion</span>
          <span style={{ color: pct === 100 ? '#22C55E' : 'inherit' }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#22C55E' : `linear-gradient(to right, ${accent}cc, ${accent})`,
            }}
          />
        </div>
      </div>

      {/* Badges */}
      {(open > 0 || overdue > 0 || inReview > 0) && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border text-[10.5px] font-semibold">
          {open > 0 && <span className="text-muted">{open} open</span>}
          {inReview > 0 && (
            <span className="text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded-full">
              {inReview} in review
            </span>
          )}
          {overdue > 0 && (
            <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">
              {overdue} overdue
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FolderOverviewPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const router = useRouter();
  const { spaces, tasks, refreshData } = useWorkspace();
  const { user } = useAuth();
  const role = user?.role || 'staff';

  const [showCreateList, setShowCreateList] = useState(false);
  const [listName, setListName] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Resolve folder and parent space from WorkspaceContext ─────────────────
  const { folder, space } = useMemo(() => {
    for (const s of spaces || []) {
      const f = (s.folders || []).find((f: any) => f.id === folderId);
      if (f) return { folder: f, space: s };
    }
    return { folder: null, space: null };
  }, [spaces, folderId]);

  if (!folder || !space) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        <AlertCircle size={18} className="mr-2 text-brand-pink" />
        Folder not found.{' '}
        <Link href="/workspace" className="ml-1 text-brand-pink underline">Go back</Link>
      </div>
    );
  }

  // ── Metrics ────────────────────────────────────────────────────────────────
  const listIds = (folder.lists || []).map((l: any) => l.id);
  const folderTasks = tasks.filter((t) => listIds.includes(t.list_id));
  const totalTasks = folderTasks.length;
  const openTasks = folderTasks.filter((t) => t.status_type !== 'closed').length;
  const doneTasks = folderTasks.filter((t) => t.status_type === 'closed').length;
  const overdueTasks = folderTasks.filter((t) => t.flags?.isOverdue).length;
  const inProgress = folderTasks.filter((t) => t.status_type === 'in_progress').length;
  const folderColor = folder.color || '#6633FF';

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/workspace/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: space.id,
          folder_id: folderId,
          name: listName.trim(),
        }),
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
      <nav className="flex items-center gap-1.5 text-[12px] text-muted flex-wrap">
        <Link href="/workspace" className="hover:text-primary transition-colors">Workspace</Link>
        <ChevronRight size={12} />
        <Link href={`/workspace/space/${space.id}`} className="hover:text-primary transition-colors">
          {space.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-primary font-semibold">{folder.name}</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${folderColor}15 0%, var(--bg-card) 60%)`,
          borderColor: `${folderColor}30`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: folderColor }}
        />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: `${folderColor}20`, border: `1.5px solid ${folderColor}50` }}
            >
              <List size={24} style={{ color: folderColor }} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: folderColor }}>
                Folder · {space.name}
              </div>
              <h1 className="text-[22px] font-extrabold text-primary leading-none">{folder.name}</h1>
              <p className="text-muted text-[13px] mt-1">
                {(folder.lists || []).length} list{folder.lists?.length !== 1 ? 's' : ''} · {totalTasks} tasks
              </p>
            </div>
          </div>

          {role === 'product_manager' && (
            <Button
              onClick={() => setShowCreateList(true)}
              size="sm"
              className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-lg gap-1.5 text-[12px] font-bold shadow-lg shadow-brand-pink/20 cursor-pointer flex-shrink-0"
            >
              <Plus size={14} /> New List
            </Button>
          )}
        </div>
      </div>

      {/* ── Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Total Tasks" value={totalTasks} icon={Layers} color="#8A9CC8" />
        <MetricCard label="Open" value={openTasks} icon={Clock} color="#F59E0B" />
        <MetricCard label="In Progress" value={inProgress} icon={BarChart2} color={folderColor} />
        <MetricCard label="Done" value={doneTasks} icon={CheckCircle2} color="#22C55E" />
        <MetricCard label="Overdue" value={overdueTasks} icon={AlertCircle} color="#FF3396" />
      </div>

      {/* ── Lists Grid ── */}
      {(folder.lists || []).length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo size={15} style={{ color: folderColor }} />
              <h2 className="text-[13px] font-bold text-primary uppercase tracking-wide">
                Lists ({folder.lists.length})
              </h2>
            </div>
            {role === 'product_manager' && (
              <button
                onClick={() => setShowCreateList(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-brand-pink transition-colors cursor-pointer"
              >
                <Plus size={12} /> Add List
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {folder.lists.map((list: any) => (
              <ListCard key={list.id} list={list} tasks={tasks} folderColor={folderColor} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <ListTodo size={36} className="mx-auto text-muted mb-3 opacity-50" />
          <p className="text-muted font-semibold">No lists in this folder yet.</p>
          {role === 'product_manager' && (
            <Button
              onClick={() => setShowCreateList(true)}
              size="sm"
              className="mt-4 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-lg gap-1.5 text-[12px] cursor-pointer"
            >
              <Plus size={13} /> Create First List
            </Button>
          )}
        </div>
      )}

      {/* ── Create List Modal ── */}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent className="bg-card border border-border text-primary rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Add List to {folder.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted uppercase">List Name</Label>
              <Input
                autoFocus
                placeholder="e.g. GETLY Roadmap"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="bg-elevated border-border text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                required
              />
            </div>
            <p className="text-[11px] text-muted">
              This list will be created inside <strong>{folder.name}</strong> with default statuses (To Do, In Progress, In Review, Blocked, Done).
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
