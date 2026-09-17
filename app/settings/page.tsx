'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { 
  Settings, 
  User as UserIcon, 
  Mail, 
  Bell, 
  Check, 
  Loader2, 
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { user } = useAuth();
  const { members, refreshData } = useWorkspace();

  const [fullName, setFullName] = useState('');
  const [prefs, setPrefs] = useState({
    assigned: true,
    mentioned: true,
    dueSoon: true,
    dependencyResolved: true,
    overdueDigest: true
  });
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const myProfile = members.find(m => m.email === user?.email);

  useEffect(() => {
    if (myProfile) {
      setFullName(myProfile.full_name || '');
      if (myProfile.notification_preferences) {
        setPrefs({
          assigned: myProfile.notification_preferences.assigned ?? true,
          mentioned: myProfile.notification_preferences.mentioned ?? true,
          dueSoon: myProfile.notification_preferences.dueSoon ?? true,
          dependencyResolved: myProfile.notification_preferences.dependencyResolved ?? true,
          overdueDigest: myProfile.notification_preferences.overdueDigest ?? true
        });
      }
    }
  }, [myProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile || savingProfile) return;

    setSavingProfile(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/members/${myProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (res.ok) {
        setStatusMsg('Profile updated successfully!');
        refreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password.');
        return;
      }

      setPasswordSuccess(data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setPasswordError('A network error occurred. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePrefChange = async (key: keyof typeof prefs, val: boolean) => {
    if (!myProfile) return;

    const newPrefs = { ...prefs, [key]: val };
    setPrefs(newPrefs);
    setSavingPrefs(true);
    try {
      await fetch(`/api/members/${myProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_preferences: newPrefs }),
      });
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto text-left">
      <div className="space-y-1">
        <h1 className="text-h1 font-bold text-primary tracking-tight">Account Settings</h1>
        <p className="text-body text-secondary">Manage your user profile information, security password, and notifications preferences.</p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-caption font-semibold rounded-xl flex items-center gap-2">
          <Check size={16} /> {statusMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-700/10">
            <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
              <UserIcon size={16} className="text-brand-pink" /> Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-caption text-secondary font-semibold">Email Address (Read-only)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="pl-9 bg-secondary/50 border-slate-700/30 text-muted rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-caption text-secondary font-semibold">Display Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter your name" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-secondary/20 p-3 rounded-xl border border-slate-700/10">
                <ShieldCheck size={16} className="text-brand-purple" />
                <span className="text-caption text-secondary font-medium">
                  Role Authorization: <strong className="text-primary capitalize">{user?.role.replace('_', ' ')}</strong>
                </span>
              </div>

              <Button type="submit" disabled={savingProfile} className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer font-bold">
                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-700/10">
            <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
              <KeyRound size={16} className="text-brand-pink" /> Security & Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-caption text-secondary leading-relaxed">
                Update your account password to secure your workspace access.
              </p>

              {passwordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-caption font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} /> {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-caption font-semibold rounded-xl flex items-center gap-2">
                  <Check size={16} /> {passwordSuccess}
                </div>
              )}

              <div className="space-y-3 max-w-md">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPass" className="text-caption text-secondary font-semibold">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPass" 
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="bg-secondary border-slate-700/50 text-primary pr-10 rounded-xl focus:border-brand-pink"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPass" className="text-caption text-secondary font-semibold">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPass" 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="bg-secondary border-slate-700/50 text-primary pr-10 rounded-xl focus:border-brand-pink"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" className="text-caption text-secondary font-semibold">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPass" 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-secondary border-slate-700/50 text-primary pr-10 rounded-xl focus:border-brand-pink"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={savingPassword} className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer font-bold">
                {savingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications Preferences */}
        <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-700/10">
            <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
              <Bell size={16} className="text-brand-purple" /> Email Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <p className="text-caption text-secondary leading-relaxed">
              Configure which platform updates you would like to receive via email notifications. In-app alerts remain active.
            </p>

            <div className="space-y-4 divide-y divide-slate-700/10">
              {/* Toggle 1: Assigned */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5 text-left">
                  <span className="text-caption font-bold text-primary">Task Assignment</span>
                  <p className="text-[11px] text-secondary">Notify me when a new task is assigned to me.</p>
                </div>
                <Switch 
                  checked={prefs.assigned} 
                  onCheckedChange={(val) => handlePrefChange('assigned', val)}
                />
              </div>

              {/* Toggle 2: Mentions */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-caption font-bold text-primary">Comment Mentions</span>
                  <p className="text-[11px] text-secondary">Notify me when someone @mentions me in comments.</p>
                </div>
                <Switch 
                  checked={prefs.mentioned} 
                  onCheckedChange={(val) => handlePrefChange('mentioned', val)}
                />
              </div>

              {/* Toggle 3: Due soon */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-caption font-bold text-primary">Due Date Warnings</span>
                  <p className="text-[11px] text-secondary">Notify me when a task I am assigned to is due tomorrow.</p>
                </div>
                <Switch 
                  checked={prefs.dueSoon} 
                  onCheckedChange={(val) => handlePrefChange('dueSoon', val)}
                />
              </div>

              {/* Toggle 4: Dependency resolved */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-caption font-bold text-primary">Blocking Tasks Resolved</span>
                  <p className="text-[11px] text-secondary">Notify me when a task blocking mine is completed.</p>
                </div>
                <Switch 
                  checked={prefs.dependencyResolved} 
                  onCheckedChange={(val) => handlePrefChange('dependencyResolved', val)}
                />
              </div>

              {/* Toggle 5: Daily digest */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-caption font-bold text-primary">Overdue Daily Digest</span>
                  <p className="text-[11px] text-secondary">Send a daily digest email listing my currently overdue tasks.</p>
                </div>
                <Switch 
                  checked={prefs.overdueDigest} 
                  onCheckedChange={(val) => handlePrefChange('overdueDigest', val)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
