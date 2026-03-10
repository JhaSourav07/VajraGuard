'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    }
    if (isAuthenticated && isPublic) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', flexDirection: 'column', gap: 16,
      }}>
        <div className="bg-grid" />
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(255,59,59,0.4)',
          animation: 'pulse-glow 1.5s ease-in-out infinite',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading VajraGuard…</span>
      </div>
    );
  }

  // Public pages (login / signup) — full screen, no sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // Auth-guarded: dashboard layout
  if (!isAuthenticated) return null;

  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </>
  );
}
