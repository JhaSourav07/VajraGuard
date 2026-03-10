'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Trash2, ShieldAlert, User, Mail,
  AlertTriangle, CheckCircle2, Loader2, UserCircle2, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token   = localStorage.getItem('vg_token');
  const guestId = sessionStorage.getItem('vg_guest_id');
  if (token)   return { Authorization: `Bearer ${token}` };
  if (guestId) return { 'X-Guest-Id': guestId };
  return {};
}

export default function SettingsPage() {
  const { user, isGuest, logout } = useAuth();
  const router = useRouter();

  const [resetConfirm, setResetConfirm]         = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState(false);
  const [resetting, setResetting]               = useState(false);
  const [deletingAccount, setDeletingAccount]   = useState(false);
  const [toast, setToast]                       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  async function handleResetData() {
    setResetting(true);
    try {
      const res = await fetch(`${API_BASE}/settings/reset-data`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('success', `Deleted ${data.deleted.threats} threats, ${data.deleted.events} events, ${data.deleted.logs} logs.`);
      setResetConfirm(false);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/settings/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      logout();
      router.replace('/login');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
      setDeletingAccount(false);
    }
  }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 72, right: 28, zIndex: 999,
              padding: '12px 18px', borderRadius: 10, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
              background: toast.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(255,59,59,0.1)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,59,59,0.3)'}`,
              color: toast.type === 'success' ? '#10B981' : 'var(--red)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: 380,
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
          Manage your account and data preferences
        </p>
      </motion.div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Account info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card" style={{ padding: '22px 26px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
            Account
          </div>

          {isGuest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(0,224,255,0.1)', border: '1px solid rgba(0,224,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UserCircle2 size={22} color="var(--blue)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Guest Session
                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 6, fontWeight: 700,
                    background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                    border: '1px solid rgba(245,158,11,0.25)', letterSpacing: 0.5,
                  }}>TEMPORARY</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={11} />
                  Data deleted when you close the tab
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))',
                  border: '1px solid rgba(124,58,237,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'var(--purple)',
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={11} />{user?.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card" style={{ padding: '22px 26px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
            Session
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Sign out</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {isGuest ? 'End your guest session' : 'Sign out of your account on this device'}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <LogOut size={14} /> Sign out
            </motion.button>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(255,59,59,0.04)',
            border: '1px solid rgba(255,59,59,0.2)',
            borderRadius: 14, padding: '22px 26px',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <ShieldAlert size={14} color="var(--red)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Danger Zone
            </span>
          </div>

          {/* Reset data */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: isGuest ? 0 : 18, borderBottom: isGuest ? 'none' : '1px solid rgba(255,59,59,0.12)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Reset all data</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Permanently delete all your threats, events, and logs. Cannot be undone.
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {!resetConfirm ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setResetConfirm(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,59,59,0.08)', color: 'var(--red)',
                    border: '1px solid rgba(255,59,59,0.25)', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                  <Trash2 size={13} /> Reset Data
                </motion.button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setResetConfirm(false)} style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer',
                  }}>Cancel</button>
                  <button onClick={handleResetData} disabled={resetting} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(255,59,59,0.4)',
                  }}>
                    {resetting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    {resetting ? 'Deleting…' : 'Confirm Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delete account — authenticated only */}
          {!isGuest && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 18 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Delete account</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Permanently delete your account and all associated data. This cannot be reversed.
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {!deleteConfirm ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: 'rgba(255,59,59,0.12)', color: 'var(--red)',
                      border: '1px solid rgba(255,59,59,0.3)', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                    <User size={13} /> Delete Account
                  </motion.button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDeleteConfirm(false)} style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deletingAccount} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: '#7f1010', color: '#fff', border: '1px solid rgba(255,59,59,0.5)', cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(255,59,59,0.3)',
                    }}>
                      {deletingAccount ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                      {deletingAccount ? 'Deleting…' : 'Yes, delete account'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`.animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
