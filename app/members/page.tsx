'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { useWorkspace } from '@/shared/context/WorkspaceContext';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Loader2,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function MembersPage() {
  const { user } = useAuth();
  const { refreshData } = useWorkspace();
  const role = user?.role || 'staff';

  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembersList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'product_manager') {
      fetchMembers();
    }
  }, [role]);

  if (role !== 'product_manager') {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <XCircle className="mx-auto text-brand-pink w-12 h-12" />
        <h3 className="text-h3 font-bold text-primary">Access Denied</h3>
        <p className="text-body text-secondary">Only Product Managers have permission to access team member management pages.</p>
      </div>
    );
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || inviting) return;

    setInviting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole
        }),
      });

      if (res.ok) {
        setInviteEmail('');
        setInviteName('');
        setInviteRole('staff');
        setInviteOpen(false);
        fetchMembers();
        refreshData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to invite user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchMembers();
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (memberId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchMembers();
        refreshData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = membersList.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeMembers = filteredMembers.filter(m => m.status === 'active');
  const pendingMembers = filteredMembers.filter(m => m.status === 'pending');
  const deactivatedMembers = filteredMembers.filter(m => m.status === 'deactivated');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-brand-navy-2 to-brand-navy p-6 rounded-2xl border border-slate-700/20 shadow-lg relative overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-h1 font-bold text-primary tracking-tight">Team Members</h1>
          <p className="text-body text-secondary max-w-xl">
            Invite new team members, manage their roles, and authorize or revoke platform access.
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl shadow-lg shadow-brand-pink/20 gap-2 cursor-pointer font-bold">
              <UserPlus size={16} /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-slate-700/30 text-primary rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-primary">Invite Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="inviteEmail" className="text-caption text-secondary font-semibold">Email Address</Label>
                <Input 
                  id="inviteEmail" 
                  type="email"
                  placeholder="e.g. alex@tmlabs.xyz" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inviteName" className="text-caption text-secondary font-semibold">Full Name (Optional)</Label>
                <Input 
                  id="inviteName" 
                  placeholder="e.g. Alex Johnson" 
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inviteRole" className="text-caption text-secondary font-semibold">Platform Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="bg-secondary border-slate-700/50 text-primary rounded-xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-slate-700/30 text-primary rounded-xl">
                    <SelectItem value="staff" className="cursor-pointer">Staff (Task assigned access)</SelectItem>
                    <SelectItem value="stakeholder" className="cursor-pointer">Stakeholder (Read-only overview)</SelectItem>
                    <SelectItem value="product_manager" className="cursor-pointer">Product Manager (Full Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} className="rounded-xl border-slate-700/50 text-secondary hover:bg-elevated cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting} className="bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl cursor-pointer font-bold">
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Filter */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-secondary" />
        <Input 
          placeholder="Search name or email..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-slate-700/50 text-primary rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink/20"
        />
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Members Table */}
          <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-slate-700/10">
              <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Active Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-elevated/40">
                  <TableRow className="border-b border-slate-700/20 hover:bg-transparent">
                    <TableHead className="text-caption text-secondary font-bold h-11">Name</TableHead>
                    <TableHead className="text-caption text-secondary font-bold h-11">Email</TableHead>
                    <TableHead className="text-caption text-secondary font-bold h-11">Role</TableHead>
                    <TableHead className="text-caption text-secondary font-bold h-11 w-16 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMembers.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="text-center py-6 text-caption text-muted">No active members.</TableCell>
                    </TableRow>
                  ) : (
                    activeMembers.map(m => (
                      <TableRow key={m.id} className="border-b border-slate-700/10 hover:bg-elevated/20 transition-all">
                        <TableCell className="py-3.5 font-medium text-primary flex items-center gap-2">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.full_name} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-elevated text-primary font-bold text-xs flex items-center justify-center">
                              {m.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {m.full_name}
                        </TableCell>
                        <TableCell className="py-3.5 text-caption text-secondary">{m.email}</TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="outline" className="rounded-lg py-0.5 border-slate-700/40 text-primary font-semibold text-caption capitalize">
                            {m.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-elevated cursor-pointer">
                                <MoreHorizontal size={16} className="text-secondary" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border border-slate-700/30 text-primary rounded-xl">
                              <DropdownMenuItem onClick={() => handleRoleUpdate(m.id, m.role === 'staff' ? 'product_manager' : 'staff')} className="gap-2 cursor-pointer hover:bg-elevated text-caption font-medium">
                                <Shield size={14} /> Promote/Demote Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(m.id, 'deactivated')} className="gap-2 cursor-pointer hover:bg-red-500/10 text-red-500 text-caption font-medium">
                                <XCircle size={14} /> Deactivate Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pending Invites Table */}
          {pendingMembers.length > 0 && (
            <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-slate-700/10">
                <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" /> Pending Invitations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-elevated/40">
                    <TableRow className="border-b border-slate-700/20 hover:bg-transparent">
                      <TableHead className="text-caption text-secondary font-bold h-11">Name</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11">Email</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11">Role</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11 w-16 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMembers.map(m => (
                      <TableRow key={m.id || m.email} className="border-b border-slate-700/10 hover:bg-elevated/20 transition-all">
                        <TableCell className="py-3.5 font-medium text-primary">{m.full_name}</TableCell>
                        <TableCell className="py-3.5 text-caption text-secondary">{m.email}</TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="outline" className="rounded-lg py-0.5 border-slate-700/40 text-primary font-semibold text-caption capitalize">
                            {m.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleStatusUpdate(m.id || m.email, 'deactivated')}
                            className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Deactivated Members Table */}
          {deactivatedMembers.length > 0 && (
            <Card className="bg-card border-slate-700/20 shadow-md rounded-2xl overflow-hidden opacity-75">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-slate-700/10">
                <CardTitle className="text-body font-bold text-primary flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" /> Deactivated Members
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-elevated/40">
                    <TableRow className="border-b border-slate-700/20 hover:bg-transparent">
                      <TableHead className="text-caption text-secondary font-bold h-11">Name</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11">Email</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11">Role</TableHead>
                      <TableHead className="text-caption text-secondary font-bold h-11 w-16 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deactivatedMembers.map(m => (
                      <TableRow key={m.id} className="border-b border-slate-700/10 hover:bg-elevated/20 transition-all">
                        <TableCell className="py-3.5 font-medium text-primary">{m.full_name}</TableCell>
                        <TableCell className="py-3.5 text-caption text-secondary">{m.email}</TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="outline" className="rounded-lg py-0.5 border-slate-700/40 text-primary font-semibold text-caption capitalize">
                            {m.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleStatusUpdate(m.id, 'active')}
                            className="text-brand-pink hover:text-brand-pink/90 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            Reactivate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
