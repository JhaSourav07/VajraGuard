'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Shield, ShieldAlert, Globe, Clock, GitBranch,
  Bot, Zap, UploadCloud, Eye, ChevronRight,
  Activity, Lock, ArrowRight, Menu, X,
} from 'lucide-react';

// ─── Animated counter ─────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

// ─── Features ─────────────────────────────────────────
const FEATURES = [
  { icon: ShieldAlert, label: 'AI Threat Detection',          desc: 'ASI-1 powered engine identifies brute force, port scans, and account takeovers in real-time.', color: '#FF3B3B' },
  { icon: Globe,       label: 'Live Threat Map',              desc: 'Visualize attacks on a world map with animated markers showing attacker origins.',             color: '#00E0FF' },
  { icon: Clock,       label: 'Event Timeline',               desc: 'Chronological view of every security event with frequency charts and risk indicators.',         color: '#F59E0B' },
  { icon: GitBranch,   label: 'Attack Graph',                 desc: 'Interactive node graph tracing the full kill chain from attacker IP to target resources.',      color: '#7C3AED' },
  { icon: Bot,         label: 'AI Security Assistant',        desc: 'Ask natural-language questions about your logs and get instant threat intelligence.',           color: '#10B981' },
  { icon: Activity,    label: 'Defense Recommendations',      desc: 'AI-generated countermeasures tailored to each detected threat pattern.',                        color: '#00E0FF' },
];

// ─── Steps ────────────────────────────────────────────
const STEPS = [
  { n: '01', icon: UploadCloud, title: 'Upload Logs',          desc: 'Drag and drop any server, SSH, or firewall log file. We support .log and .txt formats.',     color: '#00E0FF' },
  { n: '02', icon: Bot,         title: 'AI Analyzes Threats',  desc: 'Our ASI-1 engine parses, correlates, and classifies every suspicious pattern instantaneously.',color: '#FF3B3B' },
  { n: '03', icon: Eye,         title: 'Visualize & Respond',  desc: 'Review threats in the dashboard, block IPs, and follow AI-generated defensive actions.',      color: '#7C3AED' },
];

// ─── Metrics ──────────────────────────────────────────
const METRICS = [
  { value: 50000,  suffix: '+', label: 'Threats Detected' },
  { value: 2000000,suffix: '+', label: 'Log Lines Analyzed' },
  { value: 99,     suffix: '%', label: 'Detection Accuracy' },
  { value: 200,    suffix: 'ms',label: 'Avg Analysis Time' },
];

// ─── Nav ──────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 32px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(9,14,26,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(255,59,59,0.4)',
        }}>
          <Shield size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#E5E7EB', letterSpacing: -0.3 }}>VajraGuard</span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
        {['Features', 'How it works', 'Security'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#E5E7EB')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}>
            {l}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '7px 14px' }}>
          Sign in
        </Link>
        <Link href="/signup" style={{
          fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none',
          padding: '7px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)',
          boxShadow: '0 0 16px rgba(255,59,59,0.3)',
          transition: 'box-shadow 0.2s',
        }}>
          Get Started
        </Link>
        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(!open)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E5E7EB', display: 'none' }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          background: 'rgba(9,14,26,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {['Features', 'How it works', 'Security'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setOpen(false)}
              style={{ fontSize: 15, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
          <Link href="/login" style={{ fontSize: 15, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/signup" style={{ fontSize: 15, fontWeight: 600, color: '#FF3B3B', textDecoration: 'none' }}>Get Started →</Link>
        </div>
      )}
    </nav>
  );
}

// ─── Landing Page ─────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg-base)', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px', position: 'relative', textAlign: 'center',
      }}>
        {/* Animated grid */}
        <div className="bg-grid" />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: '30%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,224,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 780, position: 'relative', zIndex: 1 }}
        >
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 20, marginBottom: 28,
              background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)',
              fontSize: 11, fontWeight: 700, color: '#FF3B3B', letterSpacing: 0.8,
            }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B3B', boxShadow: '0 0 6px rgba(255,59,59,0.8)', display: 'inline-block', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
            POWERED BY ASI-1 AI · API INNOVATE 2026
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, letterSpacing: -1.5,
            lineHeight: 1.1, marginBottom: 24,
            background: 'linear-gradient(170deg, #FFFFFF 30%, rgba(229,231,235,0.6) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            AI-Powered Cyber Defense<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF3B3B, #FF8C42)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>for Modern Systems</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Detect threats, visualize attacks, and protect your infrastructure with
            intelligent security monitoring backed by ASI-1 AI.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,59,59,0.5)' }} whileTap={{ scale: 0.97 }} style={{ borderRadius: 10 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)', color: '#fff',
                textDecoration: 'none', boxShadow: '0 0 24px rgba(255,59,59,0.35)',
              }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ borderRadius: 10 }}>
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', color: '#E5E7EB',
                border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}>
                View Dashboard <ChevronRight size={15} />
              </Link>
            </motion.div>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {['Real-time detection', 'Zero config required', 'ASI-1 powered'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Animated floating shield */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: '8%', right: '8%',
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(255,59,59,0.15), rgba(124,58,237,0.1))',
            border: '1px solid rgba(255,59,59,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(255,59,59,0.15)',
          }}
        >
          <Shield size={36} color="#FF3B3B" strokeWidth={1.5} style={{ opacity: 0.7 }} />
        </motion.div>
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', top: '25%', left: '6%',
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(0,224,255,0.06)',
            border: '1px solid rgba(0,224,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Lock size={22} color="#00E0FF" strokeWidth={1.5} style={{ opacity: 0.6 }} />
        </motion.div>
        <motion.div
          animate={{ y: [-4, 10, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{
            position: 'absolute', top: '35%', right: '5%',
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Zap size={20} color="#7C3AED" strokeWidth={1.5} style={{ opacity: 0.7 }} />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            PLATFORM FEATURES
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>
            Everything you need to<br />
            <span style={{ background: 'linear-gradient(135deg,#00E0FF,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>defend your infrastructure</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
            From intelligent threat detection to interactive attack visualization — VajraGuard covers the full security spectrum.
          </p>
        </motion.div>

        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          
          {/* 1. AI Threat Detection (Span 2) */}
          <motion.div className="bento-card span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden', minHeight: 320 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ borderColor: 'rgba(255,59,59,0.3)', boxShadow: '0 20px 60px rgba(255,59,59,0.08)' }}>
            <div style={{ position: 'absolute', right: -20, bottom: -20, width: '55%', height: '110%', background: 'linear-gradient(135deg, rgba(255,59,59,0.06), transparent)', borderRadius: '24px 0 0 0', borderTop: '1px solid rgba(255,59,59,0.1)', borderLeft: '1px solid rgba(255,59,59,0.1)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }} className="bento-content">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShieldAlert size={22} color="#FF3B3B" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>AI Threat Detection</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>ASI-1 powered engine identifies brute force, port scans, and account takeovers in real-time before they breach your network.</p>
            </div>
            {/* Decorative Code Block */}
            <div className="bento-visual" style={{ position: 'absolute', right: 32, top: 0, bottom: 0, width: '35%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }} 
                  style={{ height: 28, borderRadius: 6, background: i === 2 ? 'rgba(255,59,59,0.15)' : 'rgba(255,255,255,0.02)', border: i === 2 ? '1px solid rgba(255,59,59,0.3)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <div style={{ width: i === 2 ? '65%' : `${40 + Math.random() * 40}%`, height: 4, borderRadius: 2, background: i === 2 ? '#FF3B3B' : 'rgba(255,255,255,0.1)' }} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 2. Live Threat Map (Tall, Span 1 Column, 2 Rows) */}
          <motion.div className="bento-card row-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden', minHeight: 320, display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} whileHover={{ borderColor: 'rgba(0,224,255,0.3)', boxShadow: '0 20px 60px rgba(0,224,255,0.08)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(0,224,255,0.05), transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,224,255,0.1)', border: '1px solid rgba(0,224,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Globe size={22} color="#00E0FF" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Live Threat Map</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Visualize attacks on a 3D world map with animated markers showing attacker origins and target destinations dynamically.</p>
            </div>
            {/* Decorative Globe */}
            <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: 180, border: '1px solid rgba(0,224,255,0.15)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,224,255,0.03) 0%, transparent 70%)', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} style={{ width: '100%', height: '100%', border: '1px dashed rgba(0,224,255,0.2)', borderRadius: '50%', position: 'absolute' }} />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }} style={{ width: '80%', height: '80%', border: '1px dashed rgba(0,224,255,0.1)', borderRadius: '50%', position: 'absolute' }} />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, background: '#FF3B3B', borderRadius: '50%', boxShadow: '0 0 12px #FF3B3B', position: 'absolute', top: '30%', left: '20%' }} />
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ width: 8, height: 8, background: '#00E0FF', borderRadius: '50%', boxShadow: '0 0 12px #00E0FF', position: 'absolute', bottom: '25%', right: '30%' }} />
              <div style={{ width: 1, height: '40%', background: 'linear-gradient(to bottom, transparent, rgba(0,224,255,0.4), transparent)', position: 'absolute', transform: 'rotate(45deg)' }} />
            </div>
          </motion.div>

          {/* 3. Event Timeline */}
          <motion.div className="bento-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', minHeight: 260 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} whileHover={{ borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 20px 60px rgba(245,158,11,0.08)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(0deg, rgba(245,158,11,0.05), transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="#F59E0B" />
                </div>
                <div style={{ width: 60, height: 2, background: 'rgba(245,158,11,0.2)', position: 'relative' }}>
                  <motion.div animate={{ x: [0, 60, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', left: 0, top: -2, width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Unified Timeline</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Chronological view of all security events with context-aware risk indicators.</p>
            </div>
          </motion.div>

          {/* 4. Attack Graph */}
          <motion.div className="bento-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', minHeight: 260 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} whileHover={{ borderColor: 'rgba(124,58,237,0.3)', boxShadow: '0 20px 60px rgba(124,58,237,0.08)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(180deg, rgba(124,58,237,0.05), transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <GitBranch size={20} color="#7C3AED" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Attack Graph</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Interactive node graph tracing the complete kill chain from attacker to target.</p>
            </div>
            <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 8, alignItems: 'center', opacity: 0.6 }}>
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7C3AED' }} />
               <div style={{ width: 20, height: 1, background: '#7C3AED' }} />
               <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', border: '1px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7C3AED' }} />
               </div>
            </div>
          </motion.div>

          {/* 5. AI Security Assistant (Span 2) */}
          <motion.div className="bento-card span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden', minHeight: 280 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} whileHover={{ borderColor: 'rgba(16,185,129,0.3)', boxShadow: '0 20px 60px rgba(16,185,129,0.08)' }}>
            <div style={{ position: 'absolute', bottom: -40, right: -20, width: '45%', height: '120%', background: 'linear-gradient(280deg, rgba(16,185,129,0.05), transparent)', borderRadius: '100% 0 0 0' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '55%' }} className="bento-content">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Bot size={22} color="#10B981" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>AI Security Assistant</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Chat with ASI-1 to query logs, understand threat contexts, and generate immediate incident reports in plain English.</p>
            </div>
            {/* Decorative Chat Bubbles */}
            <div className="bento-visual" style={{ position: 'absolute', right: 32, top: 48, width: '38%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} 
                style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '16px 16px 0 16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                Summarize attacks from Russia today.
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1 }} 
                style={{ alignSelf: 'flex-start', background: 'rgba(16,185,129,0.1)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, color: '#10B981', boxShadow: '0 8px 24px rgba(16,185,129,0.1)' }}>
                Found 142 brute force attempts. Grouped by IP in the dashboard.
              </motion.div>
            </div>
          </motion.div>

          {/* 6. Defense Recommendations */}
          <motion.div className="bento-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', minHeight: 280 }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} whileHover={{ borderColor: 'rgba(236,72,153,0.3)', boxShadow: '0 20px 60px rgba(236,72,153,0.08)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '70%', background: 'radial-gradient(circle at top right, rgba(236,72,153,0.06) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Activity size={20} color="#ec4899" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Countermeasures</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>AI-generated defense playbooks tailored to detected threats.</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 32px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FF3B3B', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, letterSpacing: -0.5 }}>Up and running in minutes</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {STEPS.map(({ n, icon: Icon, title, desc, color }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ textAlign: 'center', padding: '0 12px' }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 22 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: `${color}10`, border: `1px solid ${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 32px ${color}15`,
                    margin: '0 auto',
                  }}>
                    <Icon size={26} color={color} />
                  </div>
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 22, height: 22, borderRadius: 6,
                    background: color, color: '#fff', fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{n}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section id="security" style={{ padding: '100px 32px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>PLATFORM STATS</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>
            Trusted by security teams worldwide
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Designed for developers, startups, and security teams who take infrastructure protection seriously.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          {METRICS.map(({ value, suffix, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '32px 20px',
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, marginBottom: 6,
                background: 'linear-gradient(135deg,#E5E7EB,rgba(229,231,235,0.5))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                <Counter target={value} suffix={suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,59,59,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 24,
            padding: '5px 14px', borderRadius: 20,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: 0.8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.8)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            FREE TO USE · NO CREDIT CARD REQUIRED
          </div>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: -1, marginBottom: 18, lineHeight: 1.15 }}>
            Start Protecting Your<br />Systems Today
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 40 }}>
            Join security teams using VajraGuard to detect and respond to threats before they cause damage.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(255,59,59,0.5)' }} style={{ borderRadius: 10 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #FF3B3B, #C92B2B)', color: '#fff',
                textDecoration: 'none', boxShadow: '0 0 28px rgba(255,59,59,0.4)',
              }}>
                Create Free Account <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} style={{ borderRadius: 10 }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', color: '#E5E7EB',
                border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
              }}>
                Sign in <ChevronRight size={15} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#FF3B3B,#C92B2B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>VajraGuard</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 VajraGuard · Built for API Innovate 2026 Hackathon
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Security'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-card {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
            min-height: auto !important;
          }
           .bento-visual {
            display: none !important;
          }
          .bento-content {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
