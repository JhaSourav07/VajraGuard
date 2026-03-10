'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Globe, AlertTriangle, MapPin, Wifi } from 'lucide-react';
import { fetchGeoData } from '@/lib/api';

const ThreatMapInner = dynamic(() => import('@/components/ThreatMapInner'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <Globe size={28} style={{ marginRight: 10, opacity: 0.4 }} />
      Loading map...
    </div>
  ),
});

interface GeoPoint {
  lat: number;
  lng: number;
  ip: string;
  country: string;
  city: string;
  attackType: string;
  count: number;
}

export default function ThreatMapPage() {
  const [geoData, setGeoData] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeoData().then(d => setGeoData(d.geoData || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const countryCount = geoData.reduce((a, g) => ({ ...a, [g.country]: (a[g.country as keyof typeof a] || 0) + 1 }), {} as Record<string, number>);
  const topCountries = Object.entries(countryCount).sort(([, a], [, b]) => b - a).slice(0, 5);

  const STATS = [
    { label: 'Attack Sources', value: geoData.length, icon: MapPin, color: '#FF3B3B' },
    { label: 'Countries',      value: Object.keys(countryCount).length, icon: Globe, color: '#F59E0B' },
    { label: 'Total Attacks',  value: geoData.reduce((a, g) => a + g.count, 0), icon: AlertTriangle, color: '#00E0FF' },
    { label: 'Active Nodes',   value: geoData.filter(g => g.count > 1).length, icon: Wifi, color: '#7C3AED' },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>Threat Map</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>Global attack origin visualization</p>
      </motion.div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {STATS.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: `${color}12`,
              border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: 20, color, lineHeight: 1.2 }}>{loading ? '—' : value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} color="var(--blue)" />
          Live Attack Map
          <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: '50%', background: '#FF3B3B', boxShadow: '0 0 8px rgba(255,59,59,0.8)', display: 'inline-block', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ height: 460 }}>
          <ThreatMapInner geoData={geoData} />
        </div>
      </motion.div>

      {/* Top attackers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={13} color="var(--red)" /> Top Attacker Countries
          </div>
          {topCountries.length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No geo data yet</div>
            : topCountries.map(([country, count], i) => (
              <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < topCountries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>
                  {i + 1}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{country || 'Unknown'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{count}</span>
              </div>
            ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wifi size={13} color="var(--blue)" /> Top Attacker IPs
          </div>
          {geoData.length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No IP data yet</div>
            : geoData.sort((a, b) => b.count - a.count).slice(0, 5).map((g, i) => (
              <div key={g.ip} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(0,224,255,0.08)', border: '1px solid rgba(0,224,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--blue)' }}>{g.ip}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.city}, {g.country}</div>
                </div>
                <span className={`badge badge-${g.count > 20 ? 'critical' : g.count > 10 ? 'high' : 'medium'}`}>{g.count}</span>
              </div>
            ))}
        </motion.div>
      </div>
    </>
  );
}
