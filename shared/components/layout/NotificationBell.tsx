'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  task?: { id: string; name: string };
  actor?: { id: string; full_name: string; avatar_url?: string };
}

const NOTIF_TYPE_ICON: Record<string, string> = {
  assigned: '👤',
  comment: '💬',
  mention: '@',
  status_change: '🔄',
  due_soon: '⏰',
  dependency_resolved: '✅',
  default: '🔔',
};

export function NotificationBell({ isCollapsed }: { isCollapsed: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  // Poll every 60s + fetch on open
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      await fetchNotifications();
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // silent fail
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell trigger button */}
      <button
        onClick={handleOpen}
        title="Notifications"
        className={`
          w-full flex items-center p-2 rounded-lg transition-colors duration-150 group
          ${open ? 'bg-brand-pink/10 text-brand-pink' : 'text-secondary hover:bg-elevated hover:text-primary'}
        `}
      >
        <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          <Bell size={20} className={open ? 'text-brand-pink' : 'text-secondary group-hover:text-primary'} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 16,
                height: 16,
                padding: '0 3px',
                background: 'var(--color-brand-pink, #FF3396)',
                color: '#fff',
                borderRadius: 9999,
                fontSize: 9,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxShadow: '0 0 0 2px var(--color-surface-secondary, #1a1a2e)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>

        {!isCollapsed && (
          <span className="ml-3 text-body font-medium truncate">Notifications</span>
        )}
        {!isCollapsed && unreadCount > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              minWidth: 20,
              height: 20,
              padding: '0 5px',
              background: 'var(--color-brand-pink, #FF3396)',
              color: '#fff',
              borderRadius: 9999,
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 60,
            left: isCollapsed ? 68 : 252,
            width: 340,
            maxHeight: 480,
            background: 'var(--color-surface-card, #0e0e1a)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={15} style={{ color: 'var(--color-brand-pink, #FF3396)' }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    padding: '1px 7px',
                    background: 'rgba(255,51,150,0.15)',
                    color: 'var(--color-brand-pink, #FF3396)',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                title="Mark all as read"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <CheckCheck size={11} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={24} style={{ opacity: 0.4 }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => {
                const icon = NOTIF_TYPE_ICON[notif.type] || NOTIF_TYPE_ICON.default;
                const timeAgo = formatDistanceToNow(new Date(notif.created_at), { addSuffix: true });
                return (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: notif.is_read ? 'transparent' : 'rgba(255,51,150,0.04)',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Icon/avatar */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255,51,150,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                        border: '1px solid rgba(255,51,150,0.2)',
                      }}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: 2 }}>
                        {notif.message}
                        {notif.task && (
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📋 {notif.task.name}
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 10.5, color: 'var(--color-text-muted)', marginTop: 2 }}>{timeAgo}</p>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: 'var(--color-brand-pink, #FF3396)',
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
