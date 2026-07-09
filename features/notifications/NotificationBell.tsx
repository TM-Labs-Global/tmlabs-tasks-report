'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useAuth } from '@/shared/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Realtime listener for new notifications
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('realtime_user_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        // If it's for current user, prepend it
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-secondary hover:bg-elevated hover:text-primary transition-colors cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-pink text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-slate-700/30 rounded-xl shadow-xl z-sticky overflow-hidden animate-in fade-in-50 duration-200">
          <div className="p-3 border-b border-slate-700/20 flex items-center justify-between">
            <span className="font-semibold text-caption text-primary">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-brand-pink hover:text-brand-pink/80 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/10">
            {loading && notifications.length === 0 ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-5 h-5 text-brand-pink animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-caption text-secondary">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotifClick(n.id)}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-elevated/40 ${!n.is_read ? 'bg-brand-pink/[0.02] border-l-2 border-brand-pink' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.actor?.avatar_url ? (
                      <img src={n.actor.avatar_url} alt={n.actor.full_name} className="w-7 h-7 rounded-full border border-slate-700 flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-elevated text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {(n.actor?.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-primary leading-snug">
                        <strong className="font-semibold">{n.actor?.full_name || 'System'}</strong> {n.message}
                      </p>
                      {n.task && (
                        <Link 
                          href={`/tasks/${n.task.id}`}
                          className="text-[11px] text-brand-pink font-semibold hover:underline block mt-0.5 truncate"
                          onClick={(e) => {
                            setIsOpen(false);
                          }}
                        >
                          {n.task.name}
                        </Link>
                      )}
                      <span className="text-[10px] text-muted block mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
