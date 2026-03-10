'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
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
  failed_login: '#ff4444',
  successful_login: '#00ff88',
  port_scan: '#ff8c00',
  firewall_block: '#ffd700',
  web_request: '#00d4ff',
  unknown: '#94a3b8',
};

function processTimelineData(events: SecurityEvent[]) {
  const buckets: Record<string, Record<string, number>> = {};

  events.forEach((e) => {
    const time = e.timestamp
      ? e.timestamp.substring(0, 5)  // "HH:MM" or first 5 chars
      : new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (!buckets[time]) {
      buckets[time] = {
        failed_login: 0, successful_login: 0, port_scan: 0, firewall_block: 0, web_request: 0, unknown: 0,
      };
    }
    buckets[time][e.event_type] = (buckets[time][e.event_type] || 0) + 1;
  });

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, counts]) => ({ time, ...counts }));
}

export default function AttackTimelinePage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<Record<string, string | number>[]>([]);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        const evts = data.events || [];
        setEvents(evts);
        setTimelineData(processTimelineData(evts));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eventCounts = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Attack Timeline</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Chronological visualization of security events
        </p>
      </div>

      {/* Event type summary */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div
            key={type}
            className="card"
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {type.replace('_', ' ')}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color }}>
                {loading ? '...' : eventCounts[type] || 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Event Frequency Over Time</h2>
        {loading ? (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Loading timeline...
          </div>
        ) : timelineData.length === 0 ? (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 32 }}>📊</div>
            <div>No events to display. Upload logs or run a simulation.</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timelineData}>
              <defs>
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                  <linearGradient key={type} id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="failed_login" stackId="1" stroke={EVENT_COLORS.failed_login} fill={`url(#grad-failed_login)`} name="Failed Login" />
              <Area type="monotone" dataKey="port_scan" stackId="1" stroke={EVENT_COLORS.port_scan} fill={`url(#grad-port_scan)`} name="Port Scan" />
              <Area type="monotone" dataKey="firewall_block" stackId="1" stroke={EVENT_COLORS.firewall_block} fill={`url(#grad-firewall_block)`} name="Firewall Block" />
              <Area type="monotone" dataKey="web_request" stackId="1" stroke={EVENT_COLORS.web_request} fill={`url(#grad-web_request)`} name="Web Request" />
              <Area type="monotone" dataKey="successful_login" stackId="1" stroke={EVENT_COLORS.successful_login} fill={`url(#grad-successful_login)`} name="Successful Login" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Events log */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Event Log</h2>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No events found.</div>
          ) : (
            events.map((event, i) => (
              <div
                key={event._id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: EVENT_COLORS[event.event_type] || '#94a3b8',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-muted)', minWidth: 80, fontFamily: 'monospace' }}>
                  {event.timestamp || new Date(event.createdAt).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    padding: '1px 8px',
                    borderRadius: 10,
                    background: `${EVENT_COLORS[event.event_type] || '#94a3b8'}20`,
                    color: EVENT_COLORS[event.event_type] || '#94a3b8',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.event_type.replace('_', ' ')}
                </span>
                {event.ip && (
                  <span className="mono" style={{ color: 'var(--cyan)' }}>{event.ip}</span>
                )}
                {event.username && (
                  <span style={{ color: 'var(--text-muted)' }}>→ {event.username}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
