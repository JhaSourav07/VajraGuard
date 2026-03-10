'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { askAI } from '@/lib/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'What happened on my server today?',
  'Summarize all detected threats',
  'Which IP addresses are most dangerous?',
  'What defensive actions should I take immediately?',
  'Explain the brute force attack pattern',
  'Is my server currently compromised?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `## 👋 Welcome to VajraGuard AI

I'm your AI-powered cybersecurity analyst, trained to analyze your security events and threats.

**I can help you with:**
- 🔍 Analyzing detected threats
- 📊 Summarizing security events  
- 🛡️ Recommending defensive actions
- 🚨 Explaining attack patterns
- 📋 Generating security reports

**Powered by ASI-1 AI** — Ask me anything about your security data!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await askAI(question);
      const aiMsg: Message = {
        role: 'ai',
        content: data.response || 'I could not process your request. Please ensure the backend is running.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '⚠️ **Connection Error**\n\nCannot connect to the backend API. Please ensure the VajraGuard backend is running on port 5000.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function renderMarkdown(text: string) {
    return text
      .replace(/## (.*)/g, '<h2 style="color:var(--cyan);font-size:15px;font-weight:700;margin:12px 0 6px;">$1</h2>')
      .replace(/### (.*)/g, '<h3 style="color:var(--cyan);font-size:13px;font-weight:700;margin:10px 0 4px;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--yellow);">$1</strong>')
      .replace(/`(.*?)`/g, '<code style="font-family:monospace;background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;color:var(--green);font-size:11px;">$1</code>')
      .replace(/^• (.*)/gm, '<li style="margin:3px 0;padding-left:4px;">$1</li>')
      .replace(/^\d+\. (.*)/gm, '<li style="margin:3px 0;padding-left:4px;">$1</li>')
      .replace(/🔍|📊|🛡️|🚨|📋|👋|⚠️|✅|🔴|🟡|🟢/g, (m) => `<span style="font-size:16px;">${m}</span>`)
      .replace(/\n/g, '<br/>');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={24} color="var(--cyan)" />
          AI Security Assistant
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Powered by ASI-1 — Ask anything about your security events and threats
        </p>
      </div>

      {/* Suggested questions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20,
              color: 'var(--text-secondary)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(0,212,255,0.1)';
              (e.target as HTMLButtonElement).style.color = 'var(--cyan)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(0,212,255,0.05)';
              (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        className="card"
        style={{ flex: 1, overflowY: 'auto', padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  msg.role === 'ai'
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,255,136,0.1))'
                    : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'ai' ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {msg.role === 'ai' ? (
                <Bot size={16} color="var(--cyan)" />
              ) : (
                <User size={16} color="var(--text-secondary)" />
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background:
                  msg.role === 'user'
                    ? 'rgba(0,212,255,0.1)'
                    : 'rgba(17,24,39,0.8)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`,
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--text-primary)',
              }}
            >
              {msg.role === 'ai' ? (
                <div
                  className="prose-cyber"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              ) : (
                <div>{msg.content}</div>
              )}
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,255,136,0.1))',
                border: '1px solid rgba(0,212,255,0.4)',
              }}
            >
              <Bot size={16} color="var(--cyan)" />
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '4px 16px 16px 16px',
                background: 'rgba(17,24,39,0.8)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Loader2 size={14} color="var(--cyan)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ASI-1 is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '12px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about threats, events, or security recommendations..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: 13,
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-cyber"
          style={{ padding: '8px 16px', opacity: !input.trim() ? 0.4 : 1 }}
        >
          <Send size={14} />
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
