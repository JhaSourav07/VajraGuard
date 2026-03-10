import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata: Metadata = {
  title: 'VajraGuard – AI Cyber Defense Platform',
  description: 'AI-powered autonomous security operations center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>
        {/* Subtle grid overlay */}
        <div className="bg-grid" aria-hidden="true" />

        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
