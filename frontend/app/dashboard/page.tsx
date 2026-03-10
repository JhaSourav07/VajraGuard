'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Shield, Globe, Activity,
  RefreshCw, Play, TrendingUp, Cpu,
  ShieldAlert, Eye, Ban,
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { fetchStats, fetchThreats, updateThreatStatus } from '@/lib/api';
import SimulationPanel from '@/components/SimulationPanel';

interface Stats {
  total: number;
  critical: number;
  high: number;
  suspicious_ips: number;
  events: number;
  blocked: number;
}

interface Threat {
  _id: string;
  type: string;
  riskLevel: string;
  sourceIp: string;
  explanation: string;
  status: string;
  createdAt: string;
}

// ─── Animated counter ────────────────────────────────
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── Stat Card ────────────────────────────────────────
const RISK_META = {
  Critical: { color: '#FF3B3B', glow: 'rgba(255,59,59,0.25)' },
  High:     { color: '#F59E0B', glow: 'rgba(245,158,11,0.2)' },
  Medium:   { color: '#FBBF24', glow: 'rgba(251,191,36,0.15)' },
  Low:      { color: '#10B981', glow: 'rgba(16,185,129,0.2)' },
  active:   { color: '#FF3B3B', glow: 'rgba(255,59,59,0.2)' },
  blocked:  { color: '#10B981', glow: 'rgba(16,185,129,0.2)' },
};

function StatCard({
  icon: Icon, label, value, color, glow, delay = 0,
}: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: number; color: string; glow: string; delay?: number }) {
  const animated = useCounter(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, boxShadow: `0 16px 48px ${glow}` }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 22px',
        cursor: 'default',
        transition: 'border-color 0.25s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}14`,
          border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <TrendingUp size={13} color="var(--text-muted)" />
      </div>

      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: '#E5E7EB', lineHeight: 1 }}>
        {animated.toLocaleString()}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSim, setShowSim] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([fetchStats(), fetchThreats()]);
      setStats(s);
      setThreats(t.threats?.slice(0, 8) || []);
    } catch { /* backend not running */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSimComplete = useCallback(() => { loadData(); }, [loadData]);

  const handleBlock = async (threat: Threat) => {
    try { await updateThreatStatus(threat._id, 'blocked'); await loadData(); } catch { /* ignore */ }
  };

  // Build chart data from threats
  const typeChart = Object.entries(
    threats.reduce((a, t) => ({ ...a, [t.type]: (a[t.type as keyof typeof a] || 0) + 1 }), {} as Record<string, number>)
  ).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 14) + '…' : name, count }));

  const riskChart = [
    { name: 'Critical', count: stats?.critical || 0, fill: '#FF3B3B' },
    { name: 'High',     count: stats?.high || 0,     fill: '#F59E0B' },
    { name: 'Medium',   count: Math.max(0,(stats?.total || 0) - (stats?.critical || 0) - (stats?.high || 0)), fill: '#FBBF24' },
    { name: 'Low',      count: 0,                    fill: '#10B981' },
  ];

  const STATS = [
    { icon: AlertTriangle, label: 'Total Threats',    value: stats?.total || 0,          color: '#FF3B3B', glow: 'rgba(255,59,59,0.2)'   },
    { icon: Globe,         label: 'Suspicious IPs',   value: stats?.suspicious_ips || 0, color: '#F59E0B', glow: 'rgba(245,158,11,0.2)'  },
    { icon: Activity,      label: 'Events Analyzed',  value: stats?.events || 0,         color: '#00E0FF', glow: 'rgba(0,224,255,0.2)'   },
    { icon: Shield,        label: 'Critical Alerts',  value: stats?.critical || 0,       color: '#FF3B3B', glow: 'rgba(255,59,59,0.2)'   },
    { icon: Cpu,           label: 'High Risk',        value: stats?.high || 0,           color: '#7C3AED', glow: 'rgba(124,58,237,0.2)'  },
    { icon: ShieldAlert,   label: 'Threats Blocked',  value: stats?.blocked || 0,        color: '#10B981', glow: 'rgba(16,185,129,0.2)'  },
  ];

  return (
    <>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Security Overview</h1>
          <p className="page-subtitle">
            Real-time threat monitoring and AI analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-ghost" onClick={loadData} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-danger"
            onClick={() => setShowSim(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={13} />
            Simulate Attack
          </motion.button>
        </div>
      </motion.div>

      {/* Simulation Panel */}
      {showSim && (
        <SimulationPanel onClose={() => setShowSim(false)} onComplete={handleSimComplete} />
      )}

      {/* Stats grid */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {STATS.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} glow={s.glow} delay={i * 0.06} />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Threats by type */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card" style={{ padding: '20px 24px' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={14} color="var(--red)" />
            Threats by Type
          </div>
          {typeChart.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No data — run a simulation
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeChart} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Count" fill="#FF3B3B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Risk distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card" style={{ padding: '20px 24px' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--blue)" />
            Risk Level Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskChart} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Count" radius={[4,4,0,0]}>
                {riskChart.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Threats table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card" style={{ overflow: 'hidden' }}
      >
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="var(--red)" />
            Active Threats
            {threats.length > 0 && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 10,
                background: 'var(--red-dim)', color: 'var(--red)',
                border: '1px solid rgba(255,59,59,0.25)', fontWeight: 700,
              }}>
                {threats.length}
              </span>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {threats.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {loading ? 'Loading threats...' : 'No threats detected. Run a simulation to get started.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Source IP', 'Risk Level', 'Status', 'Time', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 10, color: 'var(--text-muted)',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {threats.map((threat, i) => (
                  <motion.tr
                    key={threat._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.04 }}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{threat.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {threat.explanation}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="mono" style={{ color: 'var(--blue)', fontSize: 12 }}>{threat.sourceIp}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${threat.riskLevel?.toLowerCase()}`}>{threat.riskLevel}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 600,
                        background: threat.status === 'blocked' ? 'rgba(16,185,129,0.1)' : 'rgba(255,59,59,0.08)',
                        color: threat.status === 'blocked' ? '#10B981' : 'var(--red)',
                        border: `1px solid ${threat.status === 'blocked' ? 'rgba(16,185,129,0.2)' : 'rgba(255,59,59,0.2)'}`,
                      }}>
                        {threat.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(threat.createdAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {threat.status !== 'blocked' && (
                          <button
                            onClick={() => handleBlock(threat)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                              background: 'rgba(255,59,59,0.08)', color: 'var(--red)',
                              border: '1px solid rgba(255,59,59,0.2)', cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                          >
                            <Ban size={10} /> Block
                          </button>
                        )}
                        <button style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 6, fontSize: 11,
                          background: 'rgba(0,224,255,0.06)', color: 'var(--blue)',
                          border: '1px solid rgba(0,224,255,0.15)', cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}>
                          <Eye size={10} /> View
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </>
  );
}
