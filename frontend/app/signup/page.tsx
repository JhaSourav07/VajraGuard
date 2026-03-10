'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginAsGuest } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    loginAsGuest();
    router.replace('/dashboard');
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div className="bg-grid" />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(124,58,237,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,224,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(255,59,59,0.4)',
          }}>
            <Shield size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.4, marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Start monitoring threats in minutes
          </p>
        </div>

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
            {/* Name */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="input-base" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={{ paddingLeft: 32 }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="input-base" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ paddingLeft: 32 }} />
              </div>
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input className="input-base" type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" style={{ paddingLeft: 32, paddingRight: 34 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input className="input-base" type={showPw ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••" style={{ paddingLeft: 32 }} />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="btn-danger"
              style={{ justifyContent: 'center', width: '100%', padding: '11px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating account…</> : 'Create Account'}
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGuest}
            style={{
              width: '100%', padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'rgba(0,224,255,0.06)', color: 'var(--blue)',
              border: '1px solid rgba(0,224,255,0.2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            <UserCheck size={14} /> Continue as Guest
          </motion.button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            Guest data is automatically deleted when you close the tab
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>

      <style>{`.animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
