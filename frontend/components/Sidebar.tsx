'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Upload,
  Globe,
  Clock,
  Network,
  Bot,
  Activity,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload-logs', label: 'Upload Logs', icon: Upload },
  { href: '/threat-map', label: 'Threat Map', icon: Globe },
  { href: '/attack-timeline', label: 'Timeline', icon: Clock },
  { href: '/attack-graph', label: 'Attack Graph', icon: Network },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,255,136,0.1))',
            border: '1px solid rgba(0,212,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <Shield size={20} color="var(--cyan)" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--cyan)', letterSpacing: 1 }}>
            VAJRAGUARD
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
            AI Cyber Defense
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          margin: '12px 16px',
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span className="status-dot live" />
        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>SYSTEM ACTIVE</span>
        <Activity size={12} color="var(--green)" style={{ marginLeft: 'auto' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={16} />
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 2 }}>VajraGuard v1.0</div>
        <div>Powered by ASI-1 AI</div>
        <div style={{ marginTop: 4, color: 'var(--text-muted)', opacity: 0.7 }}>API Innovate 2026</div>
      </div>
    </aside>
  );
}
