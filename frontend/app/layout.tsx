import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'VajraGuard – AI Cyber Defense Platform',
  description: 'AI-powered cybersecurity monitoring and threat intelligence powered by ASI-1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="grid-bg"
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: '100vh',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              height: 56,
              borderBottom: '1px solid var(--border)',
              background: 'rgba(13,21,41,0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              gap: 12,
              position: 'sticky',
              top: 0,
              zIndex: 50,
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <span style={{ color: 'var(--green)' }}>●</span>
              <span>LIVE MONITORING</span>
              <span style={{ marginLeft: 16, color: 'var(--text-muted)' }}>|</span>
              <span style={{ marginLeft: 16 }}>
                {new Date().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div
              style={{
                padding: '4px 12px',
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 20,
                fontSize: 11,
                color: 'var(--cyan)',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              ASI-1 CONNECTED
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
