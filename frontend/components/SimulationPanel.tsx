'use client';

import { useState } from 'react';
import {
  X, Activity, ShieldAlert, Cpu, CheckCircle,
  Loader2, AlertTriangle, ChevronRight, Play,
} from 'lucide-react';
import { runSimulation } from '@/lib/api';
import AIAnalysisCard from './AIAnalysisCard';

interface SimEvent {
  event_type: string;
  ip?: string;
  username?: string;
  timestamp?: string;
  rawLine: string;
}

interface SimThreat {
  type: string;
  riskLevel: string;
  sourceIp: string;
  explanation: string;
  recommendedActions: string[];
}

type Stage = 'idle' | 'generating' | 'events' | 'threats' | 'ai' | 'done';

const EVENT_COLORS: Record<string, string> = {
  failed_login: '#ff4444',
  successful_login: '#00ff88',
  port_scan: '#ff8c00',
  firewall_block: '#ffd700',
  web_request: '#00d4ff',
  unknown: '#94a3b8',
};

const STAGES = [
  { id: 'generating', label: 'Generating Attack' },
  { id: 'events',     label: 'Streaming Events' },
  { id: 'threats',    label: 'Detecting Threats' },
  { id: 'ai',        label: 'ASI-1 Analysis' },
  { id: 'done',       label: 'Complete' },
];

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export default function SimulationPanel({ onClose, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [visibleEvents, setVisibleEvents] = useState<SimEvent[]>([]);
  const [threats, setThreats] = useState<SimThreat[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [activeTab, setActiveTab] = useState<'events' | 'threats' | 'ai'>('events');

  const stageIdx  = STAGES.findIndex(s => s.id === stage);

  const handleStart = async () => {
    setVisibleEvents([]);
    setThreats([]);
    setAiAnalysis(null);
    setError(null);
    setActiveTab('events');

    // Stage 1 – generating
    setStage('generating');
    await delay(500);

    let data: {
      success: boolean; message?: string;
      events?: SimEvent[]; threats?: SimThreat[];
      aiAnalysis?: string; eventCount?: number;
    };

    try {
      data = await runSimulation();
      if (!data.success) {
        setError(data.message || 'Simulation failed');
        setStage('idle');
        return;
      }
    } catch {
      setError('Cannot connect to backend. Please start the backend server on port 5000.');
      setStage('idle');
      return;
    }

    const events  = data.events  || [];
    const threats = data.threats || [];
    setTotalEvents(data.eventCount || events.length);

    // Stage 2 – stream events one-by-one
    setStage('events');
    for (let i = 0; i < events.length; i++) {
      await delay(i < 10 ? 55 : 20);
      setVisibleEvents(prev => [...prev, events[i]]);
    }

    // Stage 3 – threats
    setStage('threats');
    await delay(600);
    setThreats(threats);

    // Stage 4 – AI
    setStage('ai');
    await delay(800);
    setAiAnalysis(data.aiAnalysis || null);

    // Done
    setStage('done');
    onComplete(); // refresh dashboard stats
  };

  const running = stage !== 'idle' && stage !== 'done';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={!running ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
        width: 'min(680px, 95vw)',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          background: 'rgba(255,68,68,0.04)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.35)',
          }}>
            <ShieldAlert size={18} color="var(--red)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              Attack Simulation
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Generates realistic SSH brute-force + port scan + web attack
            </div>
          </div>
          <button
            onClick={!running ? onClose : undefined}
            style={{
              background: 'none', border: 'none', cursor: running ? 'not-allowed' : 'pointer',
              color: 'var(--text-muted)', opacity: running ? 0.4 : 1, padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress stepper */}
        {stage !== 'idle' && (
          <div style={{
            padding: '14px 24px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
            background: 'rgba(0,0,0,0.15)',
          }}>
            {STAGES.map((s, i) => {
              const isDone   = i < stageIdx;
              const isActive = i === stageIdx;
              const color    = isDone ? '#00ff88' : isActive ? '#00d4ff' : '#334155';
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s',
                      background: isDone ? 'rgba(0,255,136,0.12)' : isActive ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isDone ? 'rgba(0,255,136,0.5)' : isActive ? 'rgba(0,212,255,0.55)' : '#1e2d4a'}`,
                    }}>
                      {isActive
                        ? <Loader2 size={12} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
                        : isDone
                        ? <CheckCircle size={12} color="#00ff88" />
                        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#334155' }} />
                      }
                    </div>
                    <span style={{ fontSize: 9, color, fontWeight: isActive ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: 0.2 }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: '-14px 4px 0',
                      background: isDone ? 'rgba(0,255,136,0.4)' : '#1e2d4a',
                      borderRadius: 1, transition: 'background 0.5s',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Idle state */}
          {stage === 'idle' && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
                background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Play size={32} color="var(--red)" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                Ready to Simulate
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
                This will generate realistic attack logs (SSH brute-force, port scanning, web enumeration), run them through the threat engine and ASI-1 AI, and update your dashboard in real time.
              </div>
              {error && (
                <div style={{
                  padding: '12px 16px', background: 'rgba(255,68,68,0.08)',
                  border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8,
                  color: 'var(--red)', fontSize: 13, marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
              <button className="btn-danger" onClick={handleStart} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}>
                <Play size={15} style={{ display: 'inline', marginRight: 8 }} />
                Launch Simulation
              </button>
            </div>
          )}

          {/* Running / done */}
          {stage !== 'idle' && (
            <>
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                {(['events', 'threats', 'ai'] as const)
                  .filter(tab =>
                    tab === 'events' ||
                    (tab === 'threats' && ['threats','ai','done'].includes(stage)) ||
                    (tab === 'ai' && ['ai','done'].includes(stage))
                  )
                  .map(tab => {
                    const active = activeTab === tab;
                    return (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '9px 18px', background: 'none', border: 'none',
                        borderBottom: active ? '2px solid var(--cyan)' : '2px solid transparent',
                        color: active ? 'var(--cyan)' : 'var(--text-muted)',
                        fontWeight: active ? 700 : 400, fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                      }}>
                        {tab === 'events' && <><Activity size={12} /> Events ({visibleEvents.length}{stage === 'events' ? '…' : ''})</>}
                        {tab === 'threats' && <><ShieldAlert size={12} /> Threats ({threats.length})</>}
                        {tab === 'ai' && <><Cpu size={12} /> AI Analysis {stage === 'ai' && !aiAnalysis && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />}</>}
                      </button>
                    );
                  })}
              </div>

              {/* Events tab */}
              {activeTab === 'events' && (
                <div style={{ animation: 'fadeSlideIn 0.3s ease both' }}>
                  {visibleEvents.map((ev, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '6px 10px', borderBottom: '1px solid var(--border)',
                      fontSize: 11, animation: 'fadeSlideIn 0.2s ease both',
                    }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap', fontWeight: 700,
                        fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 90, textAlign: 'center',
                        background: `${EVENT_COLORS[ev.event_type] || '#94a3b8'}18`,
                        color: EVENT_COLORS[ev.event_type] || '#94a3b8',
                        border: `1px solid ${EVENT_COLORS[ev.event_type] || '#94a3b8'}30`,
                      }}>
                        {ev.event_type.replace('_', ' ')}
                      </span>
                      {ev.ip && <span className="mono" style={{ color: 'var(--cyan)' }}>{ev.ip}</span>}
                      {ev.username && <span style={{ color: 'var(--text-muted)' }}>→ {ev.username}</span>}
                      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}>{ev.timestamp}</span>
                    </div>
                  ))}
                  {stage === 'events' && (
                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan)', fontSize: 12 }}>
                      <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      Streaming attack events...
                    </div>
                  )}
                </div>
              )}

              {/* Threats tab */}
              {activeTab === 'threats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeSlideIn 0.4s ease both' }}>
                  {threats.length === 0 && stage === 'threats' && (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      <Loader2 size={20} color="var(--cyan)" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                      Correlating threats...
                    </div>
                  )}
                  {threats.map((t, i) => {
                    const col = t.riskLevel === 'Critical' ? 'var(--red)' : t.riskLevel === 'High' ? 'var(--orange)' : t.riskLevel === 'Medium' ? 'var(--yellow)' : 'var(--green)';
                    return (
                      <div key={i} className="card" style={{ padding: 16, borderLeft: `3px solid ${col}`, animation: `fadeSlideIn 0.4s ease ${i * 0.1}s both` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: col }}>{t.type}</span>
                          <span className={`badge badge-${t.riskLevel?.toLowerCase()}`}>{t.riskLevel}</span>
                          <span className="mono" style={{ color: 'var(--cyan)', fontSize: 11, marginLeft: 'auto' }}>{t.sourceIp}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>{t.explanation}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {t.recommendedActions?.slice(0, 3).map((a, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 10px',
                              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 6,
                            }}>
                              <ChevronRight size={11} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AI Analysis tab */}
              {activeTab === 'ai' && (
                <div style={{ animation: 'fadeSlideIn 0.5s ease both' }}>
                  {aiAnalysis ? (
                    <AIAnalysisCard analysis={aiAnalysis} />
                  ) : (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 size={28} color="var(--cyan)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)' }}>ASI-1 is analyzing the attack...</div>
                      <div style={{ fontSize: 11, marginTop: 6 }}>Building threat intelligence report</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {stage === 'done' && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,255,136,0.03)',
          }}>
            <CheckCircle size={16} color="var(--green)" />
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, flex: 1 }}>
              Simulation complete — dashboard updated
            </span>
            <button className="btn-cyber" onClick={handleStart} style={{ fontSize: 11 }}>Run Again</button>
            <button className="btn-cyber" onClick={onClose} style={{ fontSize: 11 }}>Close</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}
