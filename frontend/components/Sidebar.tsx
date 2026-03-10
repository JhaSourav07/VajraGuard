'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Clock,
  GitBranch,
  UploadCloud,
  Bot,
  Settings,
  Shield,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',        label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/upload-logs',      label: 'Upload Logs',  icon: UploadCloud },
  { href: '/threat-map',       label: 'Threat Map',   icon: Globe },
  { href: '/attack-timeline',  label: 'Timeline',     icon: Clock },
  { href: '/attack-graph',     label: 'Attack Graph', icon: GitBranch },
  { href: '/ai-assistant',     label: 'AI Assistant', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        height: '100dvh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(255,59,59,0.4)',
          }}>
            <Shield size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.3, color: '#E5E7EB' }}>
              VajraGuard
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              SOC PLATFORM
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{ textDecoration: 'none', position: 'relative' }}
            >
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 9,
                  cursor: 'pointer',
                  background: active
                    ? 'linear-gradient(90deg, rgba(0,224,255,0.1), rgba(0,224,255,0.03))'
                    : 'transparent',
                  border: `1px solid ${active ? 'rgba(0,224,255,0.12)' : 'transparent'}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active left bar */}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 3,
                      background: 'var(--blue)',
                      boxShadow: '0 0 8px var(--blue)',
                    }}
                  />
                )}

                <Icon
                  size={16}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? 'var(--blue)' : 'var(--text-muted)'}
                  style={{ flexShrink: 0, transition: 'color 0.2s' }}
                />
                <span style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.2s',
                  flex: 1,
                }}>
                  {label}
                </span>
                {active && (
                  <ChevronRight size={12} color="var(--text-muted)" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Settings + version */}
      <div style={{ padding: '10px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13,
            transition: 'color 0.2s',
          }}>
            <Settings size={15} />
            <span>Settings</span>
          </div>
        </Link>
        <div style={{
          margin: '8px 12px 0',
          fontSize: 10, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px rgba(16,185,129,0.8)',
            display: 'inline-block',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />
          v1.0 · API Innovate 2026
        </div>
      </div>
    </aside>
  );
}
