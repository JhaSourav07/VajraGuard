'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, ShieldAlert, Globe, Zap } from 'lucide-react';
import { fetchEvents } from '@/lib/api';

interface SecurityEvent {
  _id: string;
  event_type: string;
  ip?: string;
  username?: string;
  timestamp?: string;
  createdAt: string;
}

const EVENT_COLORS: Record<string, string> = {
  failed_login:    '#FF3B3B',
  successful_login:'#10B981',
  port_scan:       '#F59E0B',
  firewall_block:  '#FBBF24',
  web_request:     '#00E0FF',
  unknown:         '#6B7280',
};

function buildTimeline(events: SecurityEvent[]) {
  const buckets: Record<string, Record<string, number>> = {};
  events.forEach(e => {
    const t = e.timestamp ? e.timestamp.slice(0, 5)
      : new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (!buckets[t]) buckets[t] = { failed_login: 0, successful_login: 0, port_scan: 0, firewall_block: 0, web_request: 0 };
    buckets[t][e.event_type] = (buckets[t][e.event_type] || 0) + 1;
  });
  return Object.entries(buckets).sort(([a],[b]) => a.localeCompare(b)).map(([time, v]) => ({ time, ...v }));
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AttackTimelinePage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then(d => setEvents(d.events || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const timeline = buildTimeline(events);
  const counts = events.reduce((a, e) => ({ ...a, [e.event_type]: (a[e.event_type as keyof typeof a] || 0) + 1 }), {} as Record<string, number>);

  const SUMMARY = [
    { label: 'Failed Logins',  key: 'failed_login',    icon: ShieldAlert, color: '#FF3B3B' },
    { label: 'Port Scans',     key: 'port_scan',        icon: Globe,       color: '#F59E0B' },
    { label: 'Firewall Blocks',key: 'firewall_block',   icon: Zap,         color: '#FBBF24' },
    { label: 'Web Requests',   key: 'web_request',      icon: Activity,    color: '#00E0FF' },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1 className="page-title">Attack Timeline</h1>
          <p className="page-subtitle">
            Chronological security event visualization
          </p>
        </div>
      </motion.div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {SUMMARY.map(({ label, key, icon: Icon, color }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card"
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 155 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${color}12`, border: `1px solid ${color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: 20, color, lineHeight: 1.2 }}>{loading ? '—' : counts[key] || 0}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card" style={{ padding: '22px 24px', marginBottom: 20 }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="var(--blue)" />
          Event Frequency Over Time
        </div>
        {loading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : timeline.length === 0 ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
            <Activity size={32} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: 13 }}>No events yet — upload logs or simulate an attack</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                {Object.entries(EVENT_COLORS).map(([k, c]) => (
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              {Object.entries(EVENT_COLORS).map(([k, c]) => (
                <Area key={k} type="monotone" dataKey={k} stackId="1"
                  stroke={c} strokeWidth={1.5} fill={`url(#g-${k})`} name={k.replace('_', ' ')} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Event log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="card" style={{ overflow: 'hidden' }}
      >
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={14} color="var(--red)" />
          Event Log
          {events.length > 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(0,224,255,0.2)' }}>{events.length}</span>}
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {events.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No events found.</div>
          ) : events.map((e, i) => (
            <div key={e._id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px',
              borderBottom: '1px solid var(--border)', fontSize: 12,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: EVENT_COLORS[e.event_type] || '#6B7280', flexShrink: 0,
                boxShadow: `0 0 6px ${EVENT_COLORS[e.event_type] || '#6B7280'}80` }} />
              <span style={{ color: 'var(--text-muted)', minWidth: 72, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {e.timestamp || new Date(e.createdAt).toLocaleTimeString()}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontWeight: 700, fontSize: 9,
                textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                background: `${EVENT_COLORS[e.event_type] || '#6B7280'}14`,
                color: EVENT_COLORS[e.event_type] || '#6B7280',
                border: `1px solid ${EVENT_COLORS[e.event_type] || '#6B7280'}30`,
              }}>
                {e.event_type.replace('_', ' ')}
              </span>
              {e.ip && <span className="mono" style={{ color: 'var(--blue)', fontSize: 11 }}>{e.ip}</span>}
              {e.username && <span style={{ color: 'var(--text-muted)' }}>→ {e.username}</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
