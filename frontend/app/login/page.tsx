'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, UserCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  '🔍 Real-time threat detection with ASI-1 AI',
  '🗺️  Live global attack map visualization',
  '📊 Security event timeline & analytics',
  '🛡️  AI-generated defensive recommendations',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [guestPending, setGuestPending] = useState(false);
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
    setGuestPending(true);
    loginAsGuest();
    router.replace('/dashboard');
  }

  return (
    <div style={{
      flex: 1, width: '100%',
      minHeight: '100dvh', display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      background: 'var(--bg-base)',
    }} className="auth-grid">
      <div className="bg-grid" />

      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        style={{
          background: 'linear-gradient(145deg, #080d1a 0%, #0d1529 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          borderRight: '1px solid var(--border)',
          position: 'relative', overflow: 'hidden',
        }}
        className="auth-left"
      >
        {/* Decorative glows */}
        <div style={{ position:'absolute', top:'-10%', left:'-20%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,224,255,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo + back */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 64 }}>
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#FF3B3B,#C92B2B)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(255,59,59,0.4)' }}>
                <Shield size={18} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize:16, fontWeight:800, color:'#E5E7EB', letterSpacing:-0.3 }}>VajraGuard</span>
            </Link>
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-muted)', textDecoration:'none' }}>
              <ChevronLeft size={13} /> Back
            </Link>
          </div>

          <div style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:'clamp(26px,3vw,38px)', fontWeight:900, letterSpacing:-0.6, lineHeight:1.2, marginBottom:14 }}>
              The command center<br />
              <span style={{ background:'linear-gradient(135deg,#FF3B3B,#FF8C42)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>your SOC deserves.</span>
            </h2>
            <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8 }}>
              AI-powered threat intelligence that works 24/7 to keep your infrastructure secure.
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {FEATURES.map((f,i) => (
              <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.3 + i*0.08 }}
                style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:'rgba(229,231,235,0.75)', padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                {f}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{ marginTop:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', borderRadius:20, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', fontSize:11, color:'#10B981', fontWeight:600 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px rgba(16,185,129,0.8)', display:'inline-block', animation:'pulse-glow 2s ease-in-out infinite' }} />
            Powered by ASI-1 AI · API Innovate 2026
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.4, marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
              style={{ marginBottom:18, padding:'10px 14px', borderRadius:8, background:'rgba(255,59,59,0.08)', border:'1px solid rgba(255,59,59,0.25)', color:'var(--red)', fontSize:13 }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:7 }}>Email address</label>
              <div style={{ position:'relative' }}>
                <Mail size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input className="input-base" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={{ paddingLeft:34, height:44 }} />
              </div>
            </div>

            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>Password</label>
                <a href="#" style={{ fontSize:11, color:'var(--blue)', textDecoration:'none' }}>Forgot password?</a>
              </div>
              <div style={{ position:'relative' }}>
                <Lock size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input className="input-base" type={showPw ? 'text':'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft:34, paddingRight:40, height:44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:46,
                borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer',
                background:'linear-gradient(135deg,#FF3B3B,#C92B2B)', color:'#fff', border:'none',
                boxShadow:loading?'none':'0 0 24px rgba(255,59,59,0.35)', marginTop:4,
                transition:'all 0.2s',
              }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
            </motion.button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0' }}>
            <div className="divider" style={{ flex:1 }} />
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>or continue with</span>
            <div className="divider" style={{ flex:1 }} />
          </div>

          <motion.button whileHover={{ scale:1.01, borderColor:'rgba(0,224,255,0.35)' }} whileTap={{ scale:0.98 }} onClick={handleGuest} disabled={guestPending}
            style={{
              width:'100%', height:44, borderRadius:10, fontSize:13, fontWeight:600,
              background:'rgba(0,224,255,0.05)', color:'var(--blue)',
              border:'1px solid rgba(0,224,255,0.2)', cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
            }}>
            <UserCheck size={15} /> Continue as Guest
          </motion.button>

          <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', marginTop:10 }}>
            Guest data is deleted when you close this tab
          </p>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)', marginTop:28 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Create one →</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @media (max-width:768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left  { display: none !important; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
