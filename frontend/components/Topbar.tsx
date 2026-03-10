'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, ShieldCheck, Zap, User, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar() {
  const [search, setSearch] = useState('');
  const { user, isGuest, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'rgba(9, 14, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 12,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
        <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="input-base"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search threats, IPs, events..."
          style={{ paddingLeft: 32, fontSize: 12 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* System status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 20,
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <ShieldCheck size={13} color="#10B981" />
        <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, letterSpacing: 0.5 }}>SECURE</span>
        <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
      </div>

      {/* ASI-1 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 11px', borderRadius: 20,
        background: 'rgba(0,224,255,0.06)', border: '1px solid rgba(0,224,255,0.15)',
      }}>
        <Zap size={12} color="var(--blue)" />
        <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>ASI-1</span>
      </div>

      {/* Notifications */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
      }}>
        <Bell size={14} color="var(--text-secondary)" />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 6, height: 6, borderRadius: '50%',
          background: '#FF3B3B', boxShadow: '0 0 6px rgba(255,59,59,0.8)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
      </div>

      {/* User / Guest badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 20,
        background: isGuest ? 'rgba(0,224,255,0.06)' : 'rgba(124,58,237,0.08)',
        border: `1px solid ${isGuest ? 'rgba(0,224,255,0.15)' : 'rgba(124,58,237,0.2)'}`,
      }}>
        {isGuest ? (
          <UserCircle2 size={14} color="var(--blue)" />
        ) : (
          <User size={14} color="var(--purple)" />
        )}
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: isGuest ? 'var(--blue)' : 'var(--text-primary)',
        }}>
          {isGuest ? 'Guest' : user?.name?.split(' ')[0] || 'User'}
        </span>
        {isGuest && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 6, fontWeight: 700,
            background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
            border: '1px solid rgba(245,158,11,0.25)', letterSpacing: 0.5,
          }}>
            TEMP
          </span>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Sign out"
        style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,59,0.14)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,59,0.06)'; }}
      >
        <LogOut size={13} color="var(--red)" />
      </button>
    </header>
  );
}
