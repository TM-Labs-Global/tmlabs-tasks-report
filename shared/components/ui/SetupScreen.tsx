'use client';

import React, { useState } from 'react';
import { useClickUp } from '@/shared/context/ClickUpContext';
import { Loader2, Key } from 'lucide-react';

export function SetupScreen() {
  const { setToken } = useClickUp();
  const [inputToken, setInputToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!inputToken) return;
    
    // Validate format
    if (!inputToken.startsWith('pk_')) {
      alert('Invalid token format. Personal API tokens should start with "pk_".');
      return;
    }

    setIsConnecting(true);
    try {
      // Test the token
      const response = await fetch('https://api.clickup.com/api/v2/team', {
        headers: { 'Authorization': inputToken }
      });
      
      if (!response.ok) throw new Error('Unauthorized');
      
      setToken(inputToken);
    } catch (err) {
      alert('Failed to connect. Please check your API token.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-8 max-w-md mx-auto px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center shadow-xl shadow-brand-pink/20">
        <Key size={40} className="text-white" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-h1 font-bold text-primary">TM Labs Dashboard</h1>
        <p className="text-body text-secondary">
          Enter your <span className="text-primary font-medium">ClickUp Personal API Token</span> to securely connect your workspace data.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-1 text-left">
          <label className="text-caption font-bold text-muted uppercase tracking-widest ml-1">API Token</label>
          <input 
            type="password"
            placeholder="pk_..."
            value={inputToken}
            disabled={isConnecting}
            onChange={(e) => setInputToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConnect();
            }}
            className="w-full bg-secondary border border-slate-700/30 rounded-2xl px-5 py-4 text-body focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all shadow-inner placeholder:text-slate-600"
          />
        </div>

        <button 
          onClick={handleConnect}
          disabled={isConnecting || !inputToken}
          className="w-full py-4 rounded-2xl bg-brand-pink text-white font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Verifying...
            </>
          ) : 'Connect Dashboard'}
        </button>

        <p className="text-caption text-secondary">
          Find your token in <a href="https://app.clickup.com/settings/apps" target="_blank" rel="noopener" className="text-brand-pink hover:underline">ClickUp Settings → Apps</a>
        </p>
      </div>
    </div>
  );
}
