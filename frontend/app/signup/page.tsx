'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2, UserCheck, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginAsGuest } = useAuth();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      setSuccess(true);
      setTimeout(() => router.replace('/dashboard'), 1400);
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

  // Password strength indicator
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent','#FF3B3B','#F59E0B','#10B981'][strength];
  const strengthLabel = ['','Weak','Fair','Strong'][strength];

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
        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{
          background:'linear-gradient(145deg, #080d1a 0%, #0d1529 100%)',
          display:'flex', flexDirection:'column', justifyContent:'center',
          padding:'48px 56px',
          borderRight:'1px solid var(--border)',
          position:'relative', overflow:'hidden',
        }}
        className="auth-left"
      >
        <div style={{ position:'absolute', top:'-5%', right:'-10%', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,224,255,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

        <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:72, alignSelf:'flex-start' }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#FF3B3B,#C92B2B)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(255,59,59,0.4)' }}>
            <Shield size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize:16, fontWeight:800, color:'#E5E7EB', letterSpacing:-0.3 }}>VajraGuard</span>
        </Link>

        <h2 style={{ fontSize:'clamp(26px,3vw,40px)', fontWeight:900, letterSpacing:-0.6, lineHeight:1.2, marginBottom:16 }}>
          Join the future of<br />
          <span style={{ background:'linear-gradient(135deg,#00E0FF,#7C3AED)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>cyber defense.</span>
        </h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8, marginBottom:40, maxWidth:380 }}>
          Get instant access to AI-powered threat detection, real-time attack visualization, and intelligent defense recommendations.
        </p>

        {/* Trust signals */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['50K+','Threats Detected'],['2M+','Logs Analyzed'],['99%','Accuracy'],['200ms','Response Time']].map(([v,l]) => (
            <div key={l} style={{ padding:'16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
              <div style={{ fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>{v}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:40 }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-muted)', textDecoration:'none' }}>
            <ChevronLeft size={13} /> Back to home
          </Link>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 32px' }}
      >
        <div style={{ width:'100%', maxWidth:400 }}>
          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                style={{ textAlign:'center', padding:'32px' }}>
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300, delay:0.1 }}
                  style={{ width:64, height:64, borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <CheckCircle2 size={32} color="#10B981" />
                </motion.div>
                <h2 style={{ fontWeight:800, fontSize:22, marginBottom:8 }}>Account Created!</h2>
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>Redirecting to your dashboard…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-0.4, marginBottom:6 }}>Create your account</h1>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>Start protecting your infrastructure in minutes</p>
              </div>

              {error && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                  style={{ marginBottom:16, padding:'10px 14px', borderRadius:8, background:'rgba(255,59,59,0.08)', border:'1px solid rgba(255,59,59,0.25)', color:'var(--red)', fontSize:13 }}>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:7 }}>Full Name</label>
                  <div style={{ position:'relative' }}>
                    <User size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                    <input className="input-base" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={{ paddingLeft:34, height:44 }} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:7 }}>Email address</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                    <input className="input-base" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={{ paddingLeft:34, height:44 }} />
                  </div>
                </div>

                {/* Password + confirm */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:7 }}>Password</label>
                    <div style={{ position:'relative' }}>
                      <Lock size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                      <input className="input-base" type={showPw?'text':'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" style={{ paddingLeft:34, paddingRight:36, height:44, fontSize:12 }} />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div style={{ marginTop:5, display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.07)' }}>
                          <div style={{ height:'100%', borderRadius:2, background:strengthColor, width:`${(strength/3)*100}%`, transition:'all 0.3s' }} />
                        </div>
                        <span style={{ fontSize:10, color:strengthColor, fontWeight:600 }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:7 }}>Confirm</label>
                    <div style={{ position:'relative' }}>
                      <Lock size={13} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                      <input className="input-base" type={showPw?'text':'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat" style={{ paddingLeft:34, height:44, fontSize:12,
                        borderColor: confirm && confirm !== password ? 'rgba(255,59,59,0.4)' : confirm && confirm === password ? 'rgba(16,185,129,0.3)' : undefined,
                      }} />
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:46,
                    borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer',
                    background:'linear-gradient(135deg,#FF3B3B,#C92B2B)', color:'#fff', border:'none',
                    boxShadow:'0 0 24px rgba(255,59,59,0.35)', marginTop:4, transition:'all 0.2s',
                  }}>
                  {loading ? <><Loader2 size={15} className="animate-spin" />Creating account…</> : <>Create Account <ArrowRight size={15} /></>}
                </motion.button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
                <div className="divider" style={{ flex:1 }} />
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>or</span>
                <div className="divider" style={{ flex:1 }} />
              </div>

              <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} onClick={handleGuest}
                style={{
                  width:'100%', height:44, borderRadius:10, fontSize:13, fontWeight:600,
                  background:'rgba(0,224,255,0.05)', color:'var(--blue)', border:'1px solid rgba(0,224,255,0.2)',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                <UserCheck size={15} /> Continue as Guest
              </motion.button>
              <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', marginTop:8 }}>Guest data is deleted when you close the tab</p>

              <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)', marginTop:24 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
              </p>
            </>
          )}
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
