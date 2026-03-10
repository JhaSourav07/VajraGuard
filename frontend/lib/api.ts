const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/threats/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchThreats() {
  const res = await fetch(`${API_BASE}/threats`);
  if (!res.ok) throw new Error('Failed to fetch threats');
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchGeoData() {
  const res = await fetch(`${API_BASE}/threats/geo`);
  if (!res.ok) throw new Error('Failed to fetch geo data');
  return res.json();
}

export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append('logfile', file);
  const res = await fetch(`${API_BASE}/logs/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function runSimulation() {
  const res = await fetch(`${API_BASE}/simulate`, { method: 'POST' });
  return res.json();
}

export async function askAI(question: string) {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

export async function updateThreatStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/threats/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
