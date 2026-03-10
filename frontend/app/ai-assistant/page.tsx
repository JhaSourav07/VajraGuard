'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react';
import { askAI } from '@/lib/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SUGGESTED = [
  'What happened on my server today?',
  'Summarize all detected threats',
  'Which IPs are most dangerous?',
  'What defensive actions should I take?',
  'Explain the brute force attack pattern',
  'Is my server currently compromised?',
];

function renderMarkdown(text: string) {
  return text
    .replace(/## (.*)/g, '<h2 style="color:#00E0FF;font-size:14px;font-weight:700;margin:14px 0 6px;letter-spacing:-0.2px;">$1</h2>')
    .replace(/### (.*)/g, '<h3 style="color:#00E0FF;font-size:12px;font-weight:700;margin:10px 0 4px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FBBF24;font-weight:700;">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="font-family:\'JetBrains Mono\',monospace;background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:4px;color:#10B981;font-size:11px;letter-spacing:0.3px;">$1</code>')
    .replace(/^[-•] (.*)/gm, '<div style="display:flex;gap:8px;margin:4px 0;"><span style="color:#00E0FF;font-size:9px;margin-top:4px;">▶</span><span>$1</span></div>')
    .replace(/\n/g, '<br/>');
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    content: `## Welcome to VajraGuard AI 👋

I'm your AI-powered cybersecurity analyst, backed by **ASI-1**.

I can help you:
- 🔍 Analyze detected threats and events
- 🛡️ Recommend immediate defensive actions
- 📊 Summarize security posture
- 🚨 Explain attack patterns in plain language

Ask me anything about your security data.`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: q, timestamp: new Date() }]);
    setLoading(true);
    try {
      const data = await askAI(q);
      setMessages(p => [...p, { role: 'ai', content: data.response || 'No response received.', timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, {
        role: 'ai',
        content: '⚠️ **Connection Error**\n\nCannot reach the backend API. Please ensure VajraGuard backend is running on port 5000.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--topbar-h) - 56px)', maxHeight: 900 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20 }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(0,224,255,0.2), rgba(124,58,237,0.2))',
            border: '1px solid rgba(0,224,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="var(--blue)" />
          </div>
          AI Security Assistant
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
          Powered by ASI-1 — Ask anything about your logs and threats
        </p>
      </motion.div>

      {/* Suggested chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
        {SUGGESTED.map(q => (
          <motion.button
            key={q}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(0,224,255,0.04)',
              border: '1px solid rgba(0,224,255,0.14)',
              color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = 'var(--blue)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(0,224,255,0.3)'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(0,224,255,0.14)'; }}
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'ai'
                  ? 'linear-gradient(135deg, rgba(0,224,255,0.2), rgba(124,58,237,0.15))'
                  : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                border: msg.role === 'ai' ? '1px solid rgba(0,224,255,0.25)' : 'none',
                boxShadow: msg.role === 'ai' ? '0 0 12px rgba(0,224,255,0.15)' : '0 0 12px rgba(124,58,237,0.3)',
              }}>
                {msg.role === 'ai' ? <Bot size={16} color="var(--blue)" /> : <User size={15} color="#fff" />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
                fontSize: 13,
                lineHeight: 1.75,
                color: 'var(--text-primary)',
              }}>
                {msg.role === 'ai'
                  ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  : <div>{msg.content}</div>}
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', marginTop: 8,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(0,224,255,0.2), rgba(124,58,237,0.15))',
                border: '1px solid rgba(0,224,255,0.25)',
              }}>
                <Bot size={16} color="var(--blue)" />
              </div>
              <div style={{
                padding: '12px 18px', borderRadius: '4px 14px 14px 14px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Loader2 size={14} color="var(--blue)" className="animate-spin" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ASI-1 is thinking...</span>
                {/* Bouncing dots */}
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.7, delay, repeat: Infinity }}
                    style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', opacity: 0.6 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        marginTop: 12,
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '12px 16px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14,
        transition: 'border-color 0.2s',
      }}>
        <Zap size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about threats, events, or security recommendations..."
          disabled={loading}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg, #FF3B3B, #C92B2B)' : 'rgba(255,255,255,0.05)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: input.trim() ? '0 0 16px rgba(255,59,59,0.35)' : 'none',
          }}
        >
          <Send size={14} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
        </motion.button>
      </div>

      <style>{`@keyframes animate-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} } .animate-spin{animation:animate-spin 1s linear infinite}`}</style>
    </div>
  );
}
