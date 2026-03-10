'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchGeoData } from '@/lib/api';

interface GeoPoint {
  ip: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  type?: string;
  riskLevel?: string;
}

// Leaflet must be loaded client-side only
const MapComponent = dynamic<{ geoData: GeoPoint[] }>(
  () => import('@/components/ThreatMapInner'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 12, color: 'var(--text-muted)' }}>
        Loading map...
      </div>
    ),
  }
);

export default function ThreatMapPage() {
  const [geoData, setGeoData] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeoData()
      .then((data) => setGeoData(data.geoData || []))
      .catch(() => setGeoData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Global Threat Map</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Live visualization of attack origins worldwide
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Attack Origins', value: geoData.length, color: 'var(--red)' },
          { label: 'Countries', value: new Set(geoData.map(g => g.country)).size, color: 'var(--orange)' },
          { label: 'Critical Sources', value: geoData.filter(g => g.riskLevel === 'Critical').length, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{loading ? '...' : value}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <MapComponent geoData={geoData} />
      </div>

      {/* IP table */}
      {geoData.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Attack Origin Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['IP Address', 'Location', 'Country', 'Attack Type', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {geoData.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px' }}><span className="mono" style={{ color: 'var(--cyan)' }}>{g.ip}</span></td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{g.city}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{g.country}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{g.type || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {g.riskLevel && <span className={`badge badge-${g.riskLevel.toLowerCase()}`}>{g.riskLevel}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && geoData.length === 0 && (
        <div className="card" style={{ marginTop: 20, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          No geo-located threats found. Upload logs or simulate an attack to populate the map.
          <br />
          <span style={{ fontSize: 11, marginTop: 8, display: 'block' }}>Note: Private/local IP addresses are not geo-located.</span>
        </div>
      )}
    </div>
  );
}
