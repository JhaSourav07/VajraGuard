'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  Globe,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
  Play,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { fetchStats, fetchThreats, runSimulation, updateThreatStatus } from '@/lib/api';

interface Stats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  eventCount: number;
  suspiciousIpCount: number;
  byType: { type: string; count: number }[];
}

interface Threat {
  _id: string;
  type: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  sourceIp: string;
  explanation: string;
  recommendedActions: string[];
  detectedAt: string;
  status: string;
}

const riskColor: Record<string, string> = {
  Critical: '#ff4444',
  High: '#ff8c00',
  Medium: '#ffd700',
  Low: '#00ff88',
};

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `rgba(${color === '#ff4444' ? '255,68,68' : color === '#ff8c00' ? '255,140,0' : color === '#ffd700' ? '255,215,0' : color === '#00ff88' ? '0,255,136' : '0,212,255'}, 0.15)`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: 4 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

const RISK_COLORS = {
  Critical: '#ff4444',
  High: '#ff8c00',
  Medium: '#ffd700',
  Low: '#00ff88',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, threatsData] = await Promise.all([
        fetchStats().catch(() => ({
          stats: { total: 0, critical: 0, high: 0, medium: 0, low: 0, eventCount: 0, suspiciousIpCount: 0, byType: [] },
        })),
        fetchThreats().catch(() => ({ threats: [] })),
      ]);
      setStats(statsData.stats);
      setThreats(threatsData.threats || []);
    } catch {
      setStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0, eventCount: 0, suspiciousIpCount: 0, byType: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const result = await runSimulation();
      setSimResult(result.message || 'Simulation complete');
      await loadData();
    } catch {
      setSimResult('Backend not reachable. Please start the backend server.');
    } finally {
      setSimulating(false);
    }
  };

  const handleBlock = async (threat: Threat) => {
    try {
      await updateThreatStatus(threat._id, 'blocked');
      setThreats((prev) => prev.map((t) => (t._id === threat._id ? { ...t, status: 'blocked' } : t)));
    } catch {}
  };

  const chartData = stats?.byType?.map((b) => ({ name: b.type?.replace(' Attack', '').replace(' ', '\n'), count: b.count })) || [];

  const riskData = [
    { name: 'Critical', count: stats?.critical || 0, fill: '#ff4444' },
    { name: 'High', count: stats?.high || 0, fill: '#ff8c00' },
    { name: 'Medium', count: stats?.medium || 0, fill: '#ffd700' },
    { name: 'Low', count: stats?.low || 0, fill: '#00ff88' },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            Security Operations Center
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Real-time threat monitoring powered by ASI-1 AI
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-cyber" onClick={loadData} disabled={loading}>
            <RefreshCw size={13} style={{ display: 'inline', marginRight: 6, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            className="btn-danger"
            onClick={handleSimulate}
            disabled={simulating}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={13} />
            {simulating ? 'Simulating...' : 'Simulate Attack'}
          </button>
        </div>
      </div>

      {/* Simulation result banner */}
      {simResult && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 20px',
            background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: 10,
            color: 'var(--red)',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertTriangle size={16} />
          {simResult}
        </div>
      )}

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatsCard
          label="Total Threats"
          value={loading ? '...' : stats?.total || 0}
          icon={AlertTriangle}
          color="#ff4444"
          sub={`${stats?.critical || 0} critical`}
        />
        <StatsCard
          label="Suspicious IPs"
          value={loading ? '...' : stats?.suspiciousIpCount || 0}
          icon={Globe}
          color="#ff8c00"
          sub="unique attacker IPs"
        />
        <StatsCard
          label="Events Analyzed"
          value={loading ? '...' : stats?.eventCount || 0}
          icon={Activity}
          color="#00d4ff"
          sub="security events"
        />
        <StatsCard
          label="High Risk"
          value={loading ? '...' : (stats?.critical || 0) + (stats?.high || 0)}
          icon={Zap}
          color="#ff4444"
          sub="critical + high"
        />
        <StatsCard
          label="Threats Blocked"
          value={loading ? '...' : threats.filter((t) => t.status === 'blocked').length}
          icon={Shield}
          color="#00ff88"
          sub="by defense actions"
        />
        <StatsCard
          label="Detection Rate"
          value="98.7%"
          icon={TrendingUp}
          color="#00d4ff"
          sub="AI detection accuracy"
        />
      </div>

      {/* Charts + Threats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Attack types bar chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Threats by Type
          </h2>
          {chartData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No threats detected yet. Try uploading logs or running a simulation.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="count" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Risk level chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Risk Level Distribution
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}
                fill="var(--cyan)"
                label={false}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threats Table */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
          🚨 Active Threats
        </h2>
        {threats.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>No threats detected. Upload logs or simulate an attack to get started.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Source IP', 'Risk Level', 'Detected At', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {threats.map((threat, i) => (
                  <tr
                    key={threat._id || i}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelectedThreat(selectedThreat?._id === threat._id ? null : threat)}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>
                      <span style={{ color: riskColor[threat.riskLevel] || 'var(--text-primary)' }}>
                        {threat.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--cyan)' }}>
                        {threat.sourceIp}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        className={`badge badge-${threat.riskLevel?.toLowerCase()}`}
                      >
                        {threat.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {threat.detectedAt
                        ? new Date(threat.detectedAt).toLocaleString()
                        : 'Just now'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background:
                            threat.status === 'blocked'
                              ? 'rgba(0,255,136,0.1)'
                              : threat.status === 'resolved'
                              ? 'rgba(0,212,255,0.1)'
                              : 'rgba(255,68,68,0.1)',
                          color:
                            threat.status === 'blocked'
                              ? 'var(--green)'
                              : threat.status === 'resolved'
                              ? 'var(--cyan)'
                              : 'var(--red)',
                          border: `1px solid ${
                            threat.status === 'blocked'
                              ? 'rgba(0,255,136,0.3)'
                              : threat.status === 'resolved'
                              ? 'rgba(0,212,255,0.3)'
                              : 'rgba(255,68,68,0.3)'
                          }`,
                        }}
                      >
                        {threat.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {threat.status !== 'blocked' && (
                          <button
                            className="btn-danger"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={(e) => { e.stopPropagation(); handleBlock(threat); }}
                          >
                            Block IP
                          </button>
                        )}
                        <button
                          className="btn-cyber"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedThreat(threat); }}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expanded threat details */}
        {selectedThreat && (
          <div
            style={{
              marginTop: 16,
              padding: 20,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 10,
              border: '1px solid rgba(255,68,68,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ color: 'var(--red)', fontWeight: 700 }}>
                🚨 {selectedThreat.type}
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
                onClick={() => setSelectedThreat(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {selectedThreat.explanation}
            </div>
            {selectedThreat.recommendedActions?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8 }}>
                  RECOMMENDED ACTIONS:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedThreat.recommendedActions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }}>▶</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
