'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  File as FileIcon,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { uploadLog } from '@/lib/api';
import AIAnalysisCard from '@/components/AIAnalysisCard';

interface ParsedEvent {
  event_type: string;
  ip?: string;
  username?: string;
  timestamp?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  rawLine: string;
}

interface Threat {
  type: string;
  riskLevel: string;
  sourceIp: string;
  explanation: string;
  recommendedActions: string[];
}

interface UploadResult {
  success: boolean;
  message: string;
  filename: string;
  eventCount: number;
  threatsDetected: number;
  events: ParsedEvent[];
  threats: Threat[];
  aiAnalysis?: string;
}

const EVENT_COLORS: Record<string, string> = {
  failed_login: '#ff4444',
  successful_login: '#00ff88',
  port_scan: '#ff8c00',
  firewall_block: '#ffd700',
  web_request: '#00d4ff',
  data_access: '#a855f7',
  unknown: '#94a3b8',
};

const SAMPLE_LOG = `Mar 10 10:22:31 server sshd[4521]: Failed password for root from 185.234.218.12 port 22 ssh2
Mar 10 10:22:35 server sshd[4522]: Failed password for root from 185.234.218.12 port 22 ssh2
Mar 10 10:22:40 server sshd[4523]: Failed password for admin from 185.234.218.12 port 22 ssh2
Mar 10 10:22:44 server sshd[4524]: Failed password for root from 185.234.218.12 port 22 ssh2
Mar 10 10:22:49 server sshd[4525]: Failed password for ubuntu from 185.234.218.12 port 22 ssh2
Mar 10 10:22:54 server sshd[4526]: Failed password for root from 185.234.218.12 port 22 ssh2
Mar 10 10:23:01 server sshd[4527]: Accepted password for root from 185.234.218.12 port 58422 ssh2
Mar 10 10:23:45 server kernel: [UFW BLOCK] IN=eth0 SRC=91.108.4.117 DST=10.0.1 PROTO=TCP DPT=22
Mar 10 10:23:46 server kernel: [UFW BLOCK] IN=eth0 SRC=91.108.4.117 DST=10.0.1 PROTO=TCP DPT=80
Mar 10 10:23:47 server kernel: [UFW BLOCK] IN=eth0 SRC=91.108.4.117 DST=10.0.1 PROTO=TCP DPT=443
185.234.218.12 - - [10/Mar/2026:10:25:00 +0000] "GET /admin HTTP/1.1" 404 512
185.234.218.12 - - [10/Mar/2026:10:25:01 +0000] "GET /wp-admin HTTP/1.1" 404 512
185.234.218.12 - - [10/Mar/2026:10:25:02 +0000] "GET /.env HTTP/1.1" 404 512`;

type Stage = 'idle' | 'parsing' | 'events' | 'threats' | 'ai' | 'done';

// ─── Stage Progress Bar ───────────────────────────────────────────────────────

const STAGES = [
  { id: 'parsing',  label: 'Parsing Log',         icon: Activity },
  { id: 'events',   label: 'Extracting Events',    icon: FileIcon },
  { id: 'threats',  label: 'Correlating Threats',  icon: ShieldAlert },
  { id: 'ai',       label: 'AI Analysis (ASI-1)', icon: Cpu },
  { id: 'done',     label: 'Complete',             icon: ShieldCheck },
];

function ProgressStepper({ stage }: { stage: Stage }) {
  const currentIdx = STAGES.findIndex((s) => s.id === stage);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '20px 24px',
      background: 'var(--bg-card)', borderRadius: 12,
      border: '1px solid var(--border)', marginBottom: 20,
    }}>
      {STAGES.map((s, i) => {
        const isDone   = i < currentIdx;
        const isActive = i === currentIdx;
        const Icon     = s.icon;
        const color    = isDone ? 'var(--green)' : isActive ? 'var(--cyan)' : 'var(--text-muted)';

        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s',
                background: isDone ? 'rgba(0,255,136,0.12)' : isActive ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isDone ? 'rgba(0,255,136,0.5)' : isActive ? 'rgba(0,212,255,0.6)' : 'var(--border)'}`,
              }}>
                {isActive
                  ? <Loader2 size={15} color={color} style={{ animation: 'spin 1s linear infinite' }} />
                  : isDone
                  ? <CheckCircle size={15} color="var(--green)" />
                  : <Icon size={15} color={color} />
                }
              </div>
              <span style={{ fontSize: 10, color, fontWeight: isActive ? 700 : 400, whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '-18px 6px 0',
                background: isDone ? 'linear-gradient(90deg, rgba(0,255,136,0.5), rgba(0,212,255,0.3))' : 'var(--border)',
                transition: 'background 0.5s', borderRadius: 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function UploadLogsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<ParsedEvent[]>([]);
  const [showThreats, setShowThreats] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'threats' | 'ai'>('events');

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.log') && !f.name.endsWith('.txt')) {
      setError('Only .log and .txt files are accepted');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    setStage('idle');
    setVisibleEvents([]);
    setShowThreats(false);
    setShowAI(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setResult(null);
    setVisibleEvents([]);
    setShowThreats(false);
    setShowAI(false);
    setActiveTab('events');

    setStage('parsing');
    await delay(600);

    let data: UploadResult;
    try {
      data = await uploadLog(file);
      if (!data.success) {
        setError(data.message || 'Upload failed');
        setStage('idle');
        return;
      }
    } catch {
      setError('Cannot connect to backend. Please start the backend server on port 5000.');
      setStage('idle');
      return;
    }

    setResult(data);

    // Stream events one-by-one
    setStage('events');
    const events = data.events.slice(0, 50);
    for (let i = 0; i < events.length; i++) {
      await delay(i < 10 ? 60 : 25);
      setVisibleEvents((prev) => [...prev, events[i]]);
    }

    // Threats
    setStage('threats');
    await delay(700);
    setShowThreats(true);

    // AI analysis
    setStage('ai');
    await delay(900);
    setShowAI(true);

    setStage('done');
  };

  const loadSampleLog = () => {
    const blob = new Blob([SAMPLE_LOG], { type: 'text/plain' });
    const sampleFile = new File([blob], 'sample-attack.log', { type: 'text/plain' });
    handleFile(sampleFile);
  };

  const uploading = stage !== 'idle' && stage !== 'done';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Log Analysis Engine</h1>
          <p className="page-subtitle">
            Upload access, firewall, or syslogs for ASI-1 automated threat detection.
          </p>
        </div>
      </div>
      {/* Upload zone */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--cyan)' : 'var(--border)'}`,
            borderRadius: 12, padding: '40px 24px', textAlign: 'center',
            transition: 'all 0.3s',
            background: isDragging ? 'rgba(0,212,255,0.04)' : 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => !uploading && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input" type="file" accept=".log,.txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload size={36} color={isDragging ? 'var(--cyan)' : 'var(--text-muted)'} style={{ margin: '0 auto 14px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: isDragging ? 'var(--cyan)' : 'var(--text-primary)', marginBottom: 6 }}>
            {isDragging ? 'Drop your log file here' : 'Drag & drop or click to upload'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Supports .log and .txt files — SSH, web server, firewall logs
          </div>
        </div>

        {file && (
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8,
          }}>
            <FileIcon size={16} color="var(--cyan)" />
            <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{file.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</span>
            {!uploading && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => { setFile(null); setResult(null); setStage('idle'); }}>
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 12, padding: '10px 14px', background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8,
            color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn-cyber" onClick={handleUpload} disabled={!file || uploading}
            style={{ opacity: !file || uploading ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
            {uploading
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
              : '🛡️ Analyze Log'}
          </button>
          <button className="btn-cyber" onClick={loadSampleLog} disabled={uploading} style={{ opacity: uploading ? 0.4 : 0.7 }}>
            Load Sample Log
          </button>
        </div>
      </div>

      {/* Progress stepper */}
      {stage !== 'idle' && <ProgressStepper stage={stage} />}

      {/* Results */}
      {result && (
        <div>
          {/* Summary banner */}
          <div style={{
            marginBottom: 20, padding: '14px 20px',
            background: result.threatsDetected > 0 ? 'rgba(255,68,68,0.06)' : 'rgba(0,255,136,0.06)',
            border: `1px solid ${result.threatsDetected > 0 ? 'rgba(255,68,68,0.3)' : 'rgba(0,255,136,0.3)'}`,
            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
            animation: 'fadeSlideIn 0.5s ease both',
          }}>
            {result.threatsDetected > 0
              ? <AlertTriangle size={20} color="var(--red)" />
              : <CheckCircle size={20} color="var(--green)" />}
            <div>
              <div style={{ fontWeight: 700, color: result.threatsDetected > 0 ? 'var(--red)' : 'var(--green)' }}>
                {result.threatsDetected > 0
                  ? `🚨 ${result.threatsDetected} threat(s) detected in ${result.eventCount} events`
                  : `✅ No threats detected across ${result.eventCount} events`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>File: {result.filename}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            {(['events', 'threats', 'ai'] as const)
              .filter((tab): tab is 'events' | 'threats' | 'ai' =>
                tab === 'events' ||
                (tab === 'threats' && (showThreats || ['threats','ai','done'].includes(stage))) ||
                (tab === 'ai' && (showAI || ['ai','done'].includes(stage)))
              )
              .map((tab) => {
                const available = tab === 'events' || (tab === 'threats' && showThreats) || (tab === 'ai' && showAI);
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} disabled={!available}
                    style={{
                      padding: '10px 20px', background: 'none', border: 'none',
                      borderBottom: activeTab === tab ? '2px solid var(--cyan)' : '2px solid transparent',
                      color: activeTab === tab ? 'var(--cyan)' : available ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontWeight: activeTab === tab ? 700 : 400, fontSize: 13,
                      cursor: available ? 'pointer' : 'default', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    {tab === 'events' && <><Activity size={13} />Events ({visibleEvents.length}{stage === 'events' ? '…' : ''})</>}
                    {tab === 'threats' && <><ShieldAlert size={13} />Threats ({result.threatsDetected})</>}
                    {tab === 'ai' && <>
                      <Cpu size={13} />AI Analysis
                      {!showAI && <Loader2 size={11} style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />}
                    </>}
                  </button>
                );
              })}
          </div>

          {/* Events */}
          {activeTab === 'events' && (
            <div className="card" style={{ overflow: 'hidden', animation: 'fadeSlideIn 0.4s ease both' }}>
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {visibleEvents.map((event, i) => (
                  <div key={i} style={{
                    padding: '7px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12, fontSize: 12,
                    animation: 'fadeSlideIn 0.25s ease both',
                  }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                      whiteSpace: 'nowrap', letterSpacing: 0.5, textTransform: 'uppercase',
                      minWidth: 100, textAlign: 'center',
                      background: `${EVENT_COLORS[event.event_type] || '#94a3b8'}18`,
                      color: EVENT_COLORS[event.event_type] || '#94a3b8',
                      border: `1px solid ${EVENT_COLORS[event.event_type] || '#94a3b8'}35`,
                    }}>
                      {event.event_type.replace('_', ' ')}
                    </span>
                    {event.ip && <span className="mono" style={{ color: 'var(--cyan)', minWidth: 115 }}>{event.ip}</span>}
                    {event.username && <span style={{ color: 'var(--text-muted)' }}>→ {event.username}</span>}
                    {event.url && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {event.method} {event.url}
                        {event.statusCode && (
                          <span style={{ color: event.statusCode >= 400 ? 'var(--red)' : 'var(--green)', marginLeft: 6 }}>
                            [{event.statusCode}]
                          </span>
                        )}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 'auto', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {event.timestamp}
                    </span>
                  </div>
                ))}
                {stage === 'events' && (
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan)', fontSize: 12 }}>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    Streaming events...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Threats */}
          {activeTab === 'threats' && showThreats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeSlideIn 0.5s ease both' }}>
              {result.threats.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--green)' }}>
                  <CheckCircle size={36} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 600 }}>No threats detected in this log file.</div>
                </div>
              ) : (
                result.threats.map((threat, i) => {
                  const col = threat.riskLevel === 'Critical' ? 'var(--red)'
                    : threat.riskLevel === 'High' ? 'var(--orange)'
                    : threat.riskLevel === 'Medium' ? 'var(--yellow)'
                    : 'var(--green)';
                  return (
                    <div key={i} className="card" style={{
                      padding: 20, borderLeft: `3px solid ${col}`,
                      animation: `fadeSlideIn 0.4s ease ${i * 0.1}s both`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <ShieldAlert size={18} color={col} />
                        <span style={{ fontWeight: 700, fontSize: 15, color: col }}>{threat.type}</span>
                        <span className={`badge badge-${threat.riskLevel?.toLowerCase()}`}>{threat.riskLevel}</span>
                        <span className="mono" style={{ color: 'var(--cyan)', fontSize: 12, marginLeft: 'auto' }}>{threat.sourceIp}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
                        {threat.explanation}
                      </p>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Recommended Actions
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {threat.recommendedActions?.map((action, j) => (
                          <div key={j} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            padding: '7px 12px', background: 'rgba(0,255,136,0.04)',
                            border: '1px solid rgba(0,255,136,0.12)', borderRadius: 7,
                          }}>
                            <ChevronRight size={13} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* AI Analysis */}
          {activeTab === 'ai' && (
            <div style={{ animation: 'fadeSlideIn 0.5s ease both' }}>
              {showAI && result.aiAnalysis ? (
                <div className="card" style={{ padding: 24 }}>
                  <AIAnalysisCard analysis={result.aiAnalysis} />
                </div>
              ) : showAI && !result.aiAnalysis ? (
                <div className="card" style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
                  AI analysis unavailable. Set{' '}
                  <code style={{ color: 'var(--green)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>ASI1_API_KEY</code>
                  {' '}in{' '}
                  <code style={{ color: 'var(--green)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>backend/.env</code>
                  {' '}for full AI-powered analysis.
                </div>
              ) : (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={28} color="var(--cyan)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan)' }}>ASI-1 is analyzing your logs...</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Generating threat intelligence report</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
