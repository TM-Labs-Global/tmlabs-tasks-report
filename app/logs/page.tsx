'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, Download, Users, LogIn, LogOut, Clock, RefreshCw, Loader2, Ban } from 'lucide-react';
import { exportToCSV } from '@/shared/utils/csvExport';

interface LogRecord {
  id: string;
  email: string;
  loginTime: string;
  logoutTime: string | null;
}

function getDurationMs(login: string, logout: string | null): number | null {
  if (!logout) return null;
  return new Date(logout).getTime() - new Date(login).getTime();
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/logs');
      if (!res.ok) { setError('Failed to fetch audit logs.'); return; }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setError('Network error while fetching logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(l =>
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  // KPI metrics
  const totalSessions = logs.length;
  const activeSessions = logs.filter(l => !l.logoutTime).length;
  const uniqueUsers = new Set(logs.map(l => l.email)).size;
  const avgDurationMs = (() => {
    const completed = logs.filter(l => l.logoutTime);
    if (!completed.length) return null;
    const totalMs = completed.reduce((acc, l) => acc + (getDurationMs(l.loginTime, l.logoutTime) || 0), 0);
    return Math.round(totalMs / completed.length);
  })();

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => ({
      ID: l.id,
      Email: l.email,
      'Login Time': formatDateTime(l.loginTime),
      'Logout Time': l.logoutTime ? formatDateTime(l.logoutTime) : 'Active',
      'Duration': formatDuration(getDurationMs(l.loginTime, l.logoutTime)),
      'Status': l.logoutTime ? 'Completed' : 'Active',
    }));
    exportToCSV(rows, `tm-labs-audit-logs-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-8 pb-12">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-primary flex items-center gap-2">
            <History size={22} className="text-brand-pink" /> Session Audit Log
          </h1>
          <p className="text-secondary text-sm mt-1">
            Full record of all login and logout events across all stakeholder accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-elevated border border-slate-700/30 text-secondary hover:text-primary text-sm font-medium transition-all hover:scale-105"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-pink text-white text-sm font-bold transition-all hover:scale-105 shadow-md shadow-brand-pink/20 disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: LogIn, color: 'text-brand-pink', bg: 'bg-brand-pink/10', border: 'border-brand-pink/20' },
          { label: 'Active Now', value: activeSessions, icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'Unique Users', value: uniqueUsers, icon: Users, color: 'text-brand-purple', bg: 'bg-brand-purple/10', border: 'border-brand-purple/20' },
          { label: 'Avg. Session', value: formatDuration(avgDurationMs), icon: LogOut, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-card rounded-xl border ${border} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">{label}</div>
              <div className="text-xl font-bold text-primary mt-0.5 truncate">{isLoading ? '—' : value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="log-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by email..."
          className="w-full pl-8 pr-4 py-2 bg-elevated border border-slate-700/30 rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-slate-700/20 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 gap-3">
              <Loader2 className="text-brand-pink animate-spin" size={20} />
              <span className="text-secondary text-sm">Loading audit logs...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-400">
              <Ban size={32} />
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-secondary">
              <History size={32} className="opacity-30" />
              <p className="text-sm">{search ? 'No logs match your filter.' : 'No sessions have been recorded yet.'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/20 bg-elevated/40">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">#</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Login Time</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Logout Time</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Duration</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const isActive = !log.logoutTime;
                  const duration = getDurationMs(log.loginTime, log.logoutTime);
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-700/10 hover:bg-elevated/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-pink/15 text-brand-pink flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {log.email[0]}
                          </div>
                          <span className="text-primary font-medium">{log.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary font-mono text-xs whitespace-nowrap">
                        {formatDateTime(log.loginTime)}
                      </td>
                      <td className="px-4 py-3 text-secondary font-mono text-xs whitespace-nowrap">
                        {log.logoutTime ? formatDateTime(log.logoutTime) : (
                          <span className="text-green-400 font-semibold">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-secondary text-xs">
                        {formatDuration(duration)}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700/30 text-muted border border-slate-700/20 uppercase tracking-wider">
                            Ended
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer */}
        {!isLoading && !error && filteredLogs.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-700/10 bg-elevated/20 flex items-center justify-between">
            <span className="text-xs text-muted">
              Showing <span className="font-semibold text-primary">{filteredLogs.length}</span> of <span className="font-semibold text-primary">{logs.length}</span> sessions
            </span>
            <span className="text-xs text-muted">
              {activeSessions} active · {logs.length - activeSessions} completed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
