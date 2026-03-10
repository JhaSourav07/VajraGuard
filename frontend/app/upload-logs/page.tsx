'use client';

import { useState, useCallback } from 'react';
import { Upload, File as FileIcon, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { uploadLog } from '@/lib/api';

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

export default function UploadLogsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'threats' | 'ai'>('events');

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.log') && !f.name.endsWith('.txt')) {
      setError('Only .log and .txt files are accepted');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
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
    setUploading(true);
    setError(null);
    try {
      const data = await uploadLog(file);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Cannot connect to backend. Please start the backend server on port 5000.');
    } finally {
      setUploading(false);
    }
  };

  const loadSampleLog = () => {
    const blob = new Blob([SAMPLE_LOG], { type: 'text/plain' });
    const sampleFile = new File([blob], 'sample-attack.log', { type: 'text/plain' });
    handleFile(sampleFile);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Upload Security Logs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Upload server logs to detect threats using AI-powered analysis
        </p>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--cyan)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            transition: 'all 0.3s',
            background: isDragging ? 'rgba(0,212,255,0.03)' : 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".log,.txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload size={40} color={isDragging ? 'var(--cyan)' : 'var(--text-muted)'} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: isDragging ? 'var(--cyan)' : 'var(--text-primary)', marginBottom: 8 }}>
            {isDragging ? 'Drop your log file here' : 'Drag & drop or click to upload'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Supports .log and .txt files • SSH, web server, and firewall logs
          </div>
        </div>

        {/* File selected */}
        {file && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 8,
            }}
          >
            <FileIcon size={18} color="var(--cyan)" />
            <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{file.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => { setFile(null); setResult(null); }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 16px',
              background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.3)',
              borderRadius: 8,
              color: 'var(--red)',
              fontSize: 13,
            }}
          >
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            className="btn-cyber"
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{ opacity: !file || uploading ? 0.5 : 1 }}
          >
            {uploading ? '🔄 Analyzing...' : '🛡️ Analyze Log'}
          </button>
          <button className="btn-cyber" onClick={loadSampleLog} style={{ opacity: 0.7 }}>
            Load Sample Log
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Summary banner */}
          <div
            style={{
              marginBottom: 20,
              padding: '16px 20px',
              background: result.threatsDetected > 0 ? 'rgba(255,68,68,0.06)' : 'rgba(0,255,136,0.06)',
              border: `1px solid ${result.threatsDetected > 0 ? 'rgba(255,68,68,0.3)' : 'rgba(0,255,136,0.3)'}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {result.threatsDetected > 0 ? (
              <AlertTriangle size={20} color="var(--red)" />
            ) : (
              <CheckCircle size={20} color="var(--green)" />
            )}
            <div>
              <div style={{ fontWeight: 700, color: result.threatsDetected > 0 ? 'var(--red)' : 'var(--green)' }}>
                {result.threatsDetected > 0
                  ? `🚨 ${result.threatsDetected} threat(s) detected in ${result.eventCount} events`
                  : `✅ No threats detected in ${result.eventCount} events`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                File: {result.filename}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
            {(['events', 'threats', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--cyan)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--cyan)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab ? 700 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'events' && `Events (${result.eventCount})`}
                {tab === 'threats' && `Threats (${result.threatsDetected})`}
                {tab === 'ai' && '🤖 AI Analysis'}
              </button>
            ))}
          </div>

          {/* Events tab */}
          {activeTab === 'events' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {result.events.slice(0, 50).map((event, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 16px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: `${EVENT_COLORS[event.event_type] || '#94a3b8'}20`,
                        color: EVENT_COLORS[event.event_type] || '#94a3b8',
                        border: `1px solid ${EVENT_COLORS[event.event_type] || '#94a3b8'}40`,
                        fontSize: 10,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      {event.event_type.replace('_', ' ')}
                    </span>
                    {event.ip && (
                      <span className="mono" style={{ color: 'var(--cyan)', minWidth: 120 }}>
                        {event.ip}
                      </span>
                    )}
                    {event.username && (
                      <span style={{ color: 'var(--text-muted)' }}>→ {event.username}</span>
                    )}
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
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {event.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threats tab */}
          {activeTab === 'threats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.threats.length === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--green)' }}>
                  <CheckCircle size={32} style={{ margin: '0 auto 12px' }} />
                  No threats detected in this log.
                </div>
              ) : (
                result.threats.map((threat, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: 20,
                      borderLeft: `3px solid ${
                        threat.riskLevel === 'Critical' ? 'var(--red)' :
                        threat.riskLevel === 'High' ? 'var(--orange)' :
                        threat.riskLevel === 'Medium' ? 'var(--yellow)' :
                        'var(--green)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--red)' }}>{threat.type}</span>
                      <span className={`badge badge-${threat.riskLevel?.toLowerCase()}`}>{threat.riskLevel}</span>
                      <span className="mono" style={{ color: 'var(--cyan)', fontSize: 12 }}>{threat.sourceIp}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{threat.explanation}</p>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 6 }}>RECOMMENDED ACTIONS:</div>
                    {threat.recommendedActions?.map((action, j) => (
                      <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0', paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                        → {action}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {/* AI Analysis tab */}
          {activeTab === 'ai' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>ASI-1 AI Analysis</span>
              </div>
              {result.aiAnalysis ? (
                <div
                  className="prose-cyber"
                  style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{
                    __html: result.aiAnalysis
                      .replace(/## (.*)/g, '<h2>$1</h2>')
                      .replace(/### (.*)/g, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/^• (.*)/gm, '<li>$1</li>')
                      .replace(/^\d+\. (.*)/gm, '<li>$1</li>'),
                  }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  AI analysis not available. Set your ASI1_API_KEY in backend/.env to enable full analysis.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
