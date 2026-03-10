'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    setGuestLoading(true);
    loginAsGuest();
    router.replace('/dashboard');
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div className="bg-grid" />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,59,59,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(0,224,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(255,59,59,0.4)',
          }}>
            <Shield size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.4, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sign in to your VajraGuard account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 32px' }}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: 18, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)',
                color: 'var(--red)', fontSize: 13,
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  className="input-base"
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  className="input-base"
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: 32, paddingRight: 36 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="btn-danger"
              style={{ justifyContent: 'center', width: '100%', padding: '11px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign in'}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          {/* Guest */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleGuest} disabled={guestLoading}
            style={{
              width: '100%', padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'rgba(0,224,255,0.06)', color: 'var(--blue)',
              border: '1px solid rgba(0,224,255,0.2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={14} />
            Continue as Guest
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            Guest data is automatically deleted when you close the tab
          </p>
        </div>

        {/* Signup link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </motion.div>

      <style>{`.animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
