'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchThreats } from '@/lib/api';

interface Threat {
  _id: string;
  type: string;
  riskLevel: string;
  sourceIp: string;
  recommendedActions: string[];
}

const NODE_COLORS: Record<string, string> = {
  attacker: '#ff4444',
  failed_login: '#ff8c00',
  successful_login: '#ffd700',
  data_access: '#ff4444',
  defense: '#00ff88',
  result: '#a855f7',
  server: '#00d4ff',
};

function buildGraph(threats: Threat[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (threats.length === 0) {
    // Demo graph
    const demoNodes: Node[] = [
      {
        id: 'internet',
        position: { x: 300, y: 20 },
        data: { label: '🌐 Internet' },
        style: { background: '#1a2540', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: 8, fontSize: 12, padding: '8px 14px' },
      },
      {
        id: 'attacker',
        position: { x: 300, y: 120 },
        data: { label: '🔴 Attacker IP\n185.234.218.12' },
        style: { background: 'rgba(255,68,68,0.15)', border: '2px solid #ff4444', color: '#ff4444', borderRadius: 8, fontSize: 11, padding: '10px 16px', whiteSpace: 'pre' },
      },
      {
        id: 'fail1',
        position: { x: 100, y: 250 },
        data: { label: '⚠️ Failed Login\n#1' },
        style: { background: 'rgba(255,140,0,0.1)', border: '1px solid #ff8c00', color: '#ff8c00', borderRadius: 8, fontSize: 11, padding: '8px 12px', whiteSpace: 'pre' },
      },
      {
        id: 'fail2',
        position: { x: 300, y: 250 },
        data: { label: '⚠️ Failed Login\n#2-6' },
        style: { background: 'rgba(255,140,0,0.1)', border: '1px solid #ff8c00', color: '#ff8c00', borderRadius: 8, fontSize: 11, padding: '8px 12px', whiteSpace: 'pre' },
      },
      {
        id: 'success',
        position: { x: 500, y: 250 },
        data: { label: '✅ Successful Login\nroot@server' },
        style: { background: 'rgba(255,215,0,0.1)', border: '1px solid #ffd700', color: '#ffd700', borderRadius: 8, fontSize: 11, padding: '8px 12px', whiteSpace: 'pre' },
      },
      {
        id: 'access',
        position: { x: 400, y: 380 },
        data: { label: '💀 Data Access\n+ Lateral Movement' },
        style: { background: 'rgba(255,68,68,0.1)', border: '2px solid #ff4444', color: '#ff4444', borderRadius: 8, fontSize: 11, padding: '10px 14px', whiteSpace: 'pre' },
      },
      {
        id: 'defense',
        position: { x: 150, y: 380 },
        data: { label: '🛡️ Recommended\nDefense Actions' },
        style: { background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', color: '#00ff88', borderRadius: 8, fontSize: 11, padding: '8px 12px', whiteSpace: 'pre' },
      },
    ];

    const demoEdges: Edge[] = [
      { id: 'e1', source: 'internet', target: 'attacker', animated: true, style: { stroke: '#00d4ff' } },
      { id: 'e2', source: 'attacker', target: 'fail1', animated: true, style: { stroke: '#ff4444' } },
      { id: 'e3', source: 'attacker', target: 'fail2', animated: true, style: { stroke: '#ff4444' } },
      { id: 'e4', source: 'attacker', target: 'success', animated: true, style: { stroke: '#ffd700' } },
      { id: 'e5', source: 'success', target: 'access', animated: true, style: { stroke: '#ff4444' } },
      { id: 'e6', source: 'fail2', target: 'defense', style: { stroke: '#00ff88', strokeDasharray: '5 5' } },
    ];

    return { nodes: demoNodes, edges: demoEdges };
  }

  // Build from real threats
  const attackerNodeIds: Record<string, string> = {};

  threats.forEach((threat, i) => {
    const attackerId = `attacker-${i}`;
    attackerNodeIds[threat.sourceIp] = attackerId;

    nodes.push({
      id: attackerId,
      position: { x: i * 250 + 50, y: 50 },
      data: { label: `🔴 ${threat.sourceIp}` },
      style: {
        background: 'rgba(255,68,68,0.15)', border: '2px solid #ff4444',
        color: '#ff4444', borderRadius: 8, fontSize: 11, padding: '8px 14px'
      },
    });

    const typeId = `type-${i}`;
    nodes.push({
      id: typeId,
      position: { x: i * 250 + 50, y: 180 },
      data: { label: threat.type },
      style: {
        background: 'rgba(255,140,0,0.1)', border: '1px solid #ff8c00',
        color: '#ff8c00', borderRadius: 8, fontSize: 11, padding: '8px 12px'
      },
    });

    edges.push({
      id: `e-att-${i}`, source: attackerId, target: typeId,
      animated: true, style: { stroke: '#ff4444' },
      label: threat.riskLevel,
      labelStyle: { fill: '#ff4444', fontSize: 10 },
    });

    const defenseId = `defense-${i}`;
    nodes.push({
      id: defenseId,
      position: { x: i * 250 + 50, y: 310 },
      data: { label: `🛡️ ${threat.recommendedActions?.[0] || 'Block IP'}` },
      style: {
        background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88',
        color: '#00ff88', borderRadius: 8, fontSize: 10, padding: '8px 12px', maxWidth: 160
      },
    });

    edges.push({
      id: `e-def-${i}`, source: typeId, target: defenseId,
      style: { stroke: '#00ff88', strokeDasharray: '4 4' },
    });
  });

  return { nodes, edges };
}

export default function AttackGraphPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchThreats()
      .then((data) => {
        const t = data.threats || [];
        setThreats(t);
        const { nodes: n, edges: e } = buildGraph(t);
        setNodes(n);
        setEdges(e);
      })
      .catch(() => {
        const { nodes: n, edges: e } = buildGraph([]);
        setNodes(n);
        setEdges(e);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Attack Graph</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Visual attack chain analysis – from attacker to compromise to recommended defense
        </p>
      </div>

      {threats.length === 0 && !loading && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 16px',
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--cyan)',
          }}
        >
          Showing demo attack graph. Upload logs or run a simulation to see your actual attack chains.
        </div>
      )}

      <div className="card" style={{ height: 550, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Building attack graph...
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Background variant={BackgroundVariant.Dots} color="#1e2d4a" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(n) => n.style?.color as string || '#00d4ff'}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </ReactFlow>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Attacker IP', color: '#ff4444' },
          { label: 'Attack Type', color: '#ff8c00' },
          { label: 'Compromise', color: '#ffd700' },
          { label: 'Defense Action', color: '#00ff88' },
          { label: 'Data Impact', color: '#a855f7' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
