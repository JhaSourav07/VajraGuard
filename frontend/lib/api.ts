const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Auth header resolver ──────────────────────────────────────────────────────
// Called lazily so it always reads the latest value from storage,
// even before the React context is hydrated.
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token   = localStorage.getItem('vg_token');
  const guestId = sessionStorage.getItem('vg_guest_id');
  if (token)   return { Authorization: `Bearer ${token}` };
  if (guestId) return { 'X-Guest-Id': guestId };
  return {};
}

// ─── Base fetch helper ─────────────────────────────────────────────────────────
async function apiFetch(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok && res.status !== 200) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function fetchStats() {
  return apiFetch('/threats/stats');
}

export async function fetchThreats() {
  return apiFetch('/threats');
}

export async function fetchEvents() {
  return apiFetch('/events');
}

export async function fetchGeoData() {
  return apiFetch('/threats/geo');
}

export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append('logfile', file);
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/logs/upload`, {
    method: 'POST',
    headers,           // do NOT set Content-Type – browser sets it with boundary
    body: formData,
  });
  return res.json();
}

export async function runSimulation() {
  return apiFetch('/simulate', { method: 'POST' });
}

export async function askAI(question: string) {
  return apiFetch('/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
}

export async function updateThreatStatus(id: string, status: string) {
  return apiFetch(`/threats/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// ─── Auth API ──────────────────────────────────────────────────────────────────

export async function authLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function authRegister(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}
