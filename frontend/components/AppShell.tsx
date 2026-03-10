'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion } from 'framer-motion';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/') && r !== '/');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    }
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', flexDirection: 'column', gap: 16, zIndex: 999
      }}>
        <div className="bg-grid" />
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(255,59,59,0.4)',
          animation: 'pulse-glow 1.5s ease-in-out infinite',
          position: 'relative', zIndex: 1
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, position: 'relative', zIndex: 1, letterSpacing: 0.5 }}>
          LOADING VAJRAGUARD
        </span>
      </div>
    );
  }

  // Public pages (landing, login, signup) — no shell
  if (isPublic && !isAuthenticated || pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  // Auth-guarded: Dashboard shell
  if (!isAuthenticated && !isPublic) return null;

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="page-main">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
