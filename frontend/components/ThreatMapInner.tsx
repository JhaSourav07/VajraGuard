'use client';

import { useEffect, useRef, useState } from 'react';

interface GeoPoint {
  ip: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  type?: string;
  riskLevel?: string;
}

const RISK_COLORS: Record<string, string> = {
  Critical: '#ff4444',
  High: '#ff8c00',
  Medium: '#ffd700',
  Low: '#00ff88',
};

export default function ThreatMapInner({ geoData }: { geoData: GeoPoint[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy any existing map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Leaflet stamps a _leaflet_id on the container div. If the component
    // remounts (e.g. React Strict Mode double-invoke) without a full DOM
    // teardown the id lingers and causes "Map container is already initialized".
    // Deleting it lets Leaflet treat the element as fresh.
    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    let cancelled = false; // guard against stale async callbacks

    async function initMap() {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return; // effect already cleaned up

      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Clear _leaflet_id again in case the await let another render sneak in
      const el = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (el._leaflet_id) delete el._leaflet_id;

      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapInstance.current = map;

      // Add markers
      geoData.forEach((point) => {
        if (!point.lat || !point.lng) return;
        const color = RISK_COLORS[point.riskLevel || 'Medium'] || '#ff8c00';

        // Custom pulse marker using divIcon
        const icon = L.divIcon({
          html: `
            <div style="position:relative;width:20px;height:20px;">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:${color};opacity:0.3;
                animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
              "></div>
              <div style="
                position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                width:10px;height:10px;border-radius:50%;
                background:${color};
                box-shadow:0 0 8px ${color};
              "></div>
            </div>
          `,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([point.lat, point.lng], { icon });
        marker.addTo(map);
        marker.bindPopup(`
          <div style="font-family:monospace;font-size:12px;min-width:160px;">
            <strong style="color:#ff4444;">${point.type || 'Threat'}</strong><br/>
            <span style="color:#00d4ff;">${point.ip}</span><br/>
            ${point.city}, ${point.country}<br/>
            Risk: <span style="color:${color};font-weight:bold;">${point.riskLevel || 'Medium'}</span>
          </div>
        `);
      });
    }

    initMap();

    return () => {
      cancelled = true; // abort any pending async initMap
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [geoData]);

  return (
    <div>
      <style>{`
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-tile { filter: brightness(0.35) saturate(0.4) hue-rotate(190deg) !important; }
        .leaflet-popup-content-wrapper { background: #111827 !important; border: 1px solid #1e2d4a !important; color: #e2e8f0 !important; }
        .leaflet-popup-tip { background: #111827 !important; }
      `}</style>
      <div ref={mapRef} style={{ height: 500, width: '100%' }} />
    </div>
  );
}
