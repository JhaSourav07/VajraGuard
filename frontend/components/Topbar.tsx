'use client';

import { useState } from 'react';
import { Search, Bell, ShieldCheck, User, Zap } from 'lucide-react';

export default function Topbar() {
  const [search, setSearch] = useState('');

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'rgba(9, 14, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
        <Search
          size={13}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          className="input-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threats, IPs, events..."
          style={{ paddingLeft: 32, fontSize: 12 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* System status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 14px', borderRadius: 20,
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <ShieldCheck size={13} color="#10B981" />
        <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, letterSpacing: 0.5 }}>
          SYSTEM SECURE
        </span>
        <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
      </div>

      {/* ASI-1 status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 20,
        background: 'rgba(0,224,255,0.06)',
        border: '1px solid rgba(0,224,255,0.15)',
      }}>
        <Zap size={12} color="var(--blue)" />
        <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, letterSpacing: 0.5 }}>
          ASI-1
        </span>
      </div>

      {/* Notifications */}
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <Bell size={15} color="var(--text-secondary)" />
        {/* Notification badge */}
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          background: '#FF3B3B',
          boxShadow: '0 0 6px rgba(255,59,59,0.8)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
      </div>

      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 0 12px rgba(124,58,237,0.35)',
        flexShrink: 0,
      }}>
        <User size={16} color="#fff" strokeWidth={2} />
      </div>
    </header>
  );
}
