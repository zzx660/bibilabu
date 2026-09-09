const base = (import.meta.env.VITE_API_BASE as string) || '/api'

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(base + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  })
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => '')}`)
  return r.json() as Promise<T>
}

export const api = {
  searchVerses: (q: string, limit = 50) =>
    call<{ items: any[]; total: number }>(`/bible/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  readChapter: (book: string, chapter: number) =>
    call<{ chapter: any[] }>(`/bible/${book}/${chapter}`),

  listBooks: () => call<{ books: any[] }>(`/bible/books`),

  searchPersons: (q?: string) =>
    call<{ items: any[] }>(`/persons${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  personDetail: (id: number) => call<{ person: any }>(`/persons/${id}`),

  askGlm: (question: string, context?: string) =>
    call<{ answer: string; refs: { verses: string[]; persons: string[] } }>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, context })
    }),

  explainVerse: (verse: string) =>
    call<{ answer: string; verse: string }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ verse })
    }),

  ragAsk: (question: string) =>
    call<{ answer: string; chunks: { title: string; source: string; snippet: string }[]; fallback?: boolean }>('/ai/rag', {
      method: 'POST',
      body: JSON.stringify({ question })
    }),

  kbSearch: (query: string) =>
    call<{ items: any[] }>('/kb/search', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),

  // ============ 账号 ============
  register: (username: string, password: string, invite_code?: string) =>
    call<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, invite_code })
    }),

  login: (username: string, password: string) =>
    call<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  me: () =>
    call<{ profile: any }>('/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` } }),

  changeInviteCode: (invite_code: string, target_id?: string) =>
    call<any>('/auth/invite-code', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
      body: JSON.stringify({ invite_code, target_id })
    }),

  setRole: (target_id: string, role: 'admin' | 'user') =>
    call<any>('/auth/role', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
      body: JSON.stringify({ target_id, role })
    }),

  searchUser: (q: string) =>
    call<{ items: any[] }>(`/auth/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),

  // ============ 好友 ============
  listFriends: () =>
    call<{ friends: any[]; requests: any[] }>('/friends', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),

  requestFriend: (friend_code: string) =>
    call<any>('/friends/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
      body: JSON.stringify({ friend_code })
    }),

  acceptFriend: (from_id: string) =>
    call<any>('/friends/accept', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
      body: JSON.stringify({ from_id })
    }),

  removeFriend: (id: string) =>
    call<any>(`/friends/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),

  deleteAccount: (token: string) =>
    call<{ ok: boolean }>('/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
}
