const API_BASE = '/api';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  const res = await fetch(`${API_BASE}${url}`, config);
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.detail || errorJson.error || errorJson.trace || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204 || config.method === 'DELETE') {
    return res.json().catch(() => null);
  }
  return res.json();
}

// ─── Birthdays ──────────────────────────────────────────────────
export const birthdayApi = {
  getAll: (search) => request(`/birthdays/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getByMonth: (month) => request(`/birthdays/month/${month}`),
  getById: (id) => request(`/birthdays/${id}`),
  create: (data) => request('/birthdays/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/birthdays/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/birthdays/${id}`, { method: 'DELETE' }),
};

// ─── Jiya ───────────────────────────────────────────────────────
export const jiyaApi = {
  getDetails: () => request('/jiya/details'),
  updateDetails: (data) => request('/jiya/details', { method: 'PUT', body: JSON.stringify(data) }),
  getNotes: () => request('/jiya/notes'),
  createNote: (data) => request('/jiya/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => request(`/jiya/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/jiya/notes/${id}`, { method: 'DELETE' }),
  getBucketList: () => request('/jiya/bucketlist'),
  createBucketItem: (data) => request('/jiya/bucketlist', { method: 'POST', body: JSON.stringify(data) }),
  updateBucketItem: (id, data) => request(`/jiya/bucketlist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBucketItem: (id) => request(`/jiya/bucketlist/${id}`, { method: 'DELETE' }),
};

// ─── Pree ───────────────────────────────────────────────────────
export const preeApi = {
  getDetails: () => request('/pree/details'),
  updateDetails: (data) => request('/pree/details', { method: 'PUT', body: JSON.stringify(data) }),
  getNotes: () => request('/pree/notes'),
  createNote: (data) => request('/pree/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => request(`/pree/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/pree/notes/${id}`, { method: 'DELETE' }),
};

// ─── Events ─────────────────────────────────────────────────────
export const eventApi = {
  getAll: (category) => request(`/events/${category ? `?category=${category}` : ''}`),
  getUpcoming: (days = 7) => request(`/events/upcoming?days=${days}`),
  getToday: () => request('/events/today'),
  getReminders: () => request('/events/reminders'),
  getDashboard: () => request('/events/dashboard'),
  getById: (id) => request(`/events/${id}`),
  create: (data) => request('/events/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' }),
};
