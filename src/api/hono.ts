const base = (import.meta.env.VITE_API_BASE as string) || '/api'

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(base + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  })
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => '')}`)
  return r.json() as Promise<T>
}

const token = () => localStorage.getItem('sb_token') || ''
const authH = () => ({ Authorization: `Bearer ${token()}` })

export const api = {
  searchVerses: (q: string, page = 1, limit = 50) =>
    call<{ items: any[]; total: number; page: number; total_pages: number }>(
      `/bible/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
    ),

  searchPersons: (q?: string, page = 1, limit = 50) =>
    call<{ items: any[]; total: number; page: number; total_pages: number }>(
      `/persons${q ? `?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`}`
    ),

  readChapter: (book: string, chapter: number) =>
    call<{ chapter: any[] }>(`/bible/${book}/${chapter}`),

  listBooks: () => call<{ books: any[] }>(`/bible/books`),

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

  // ============ AI 历史 ============
  aiHistory: () => call<{ items: any[] }>('/ai/history', { headers: authH() }),
  clearAiHistory: () => call<{ ok: boolean }>('/ai/history', { method: 'DELETE', headers: authH() }),

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

  me: () => call<{ profile: any }>('/auth/me', { headers: authH() }),

  changeInviteCode: (invite_code: string, target_id?: string) =>
    call<any>('/auth/invite-code', {
      method: 'PUT',
      headers: authH(),
      body: JSON.stringify({ invite_code, target_id })
    }),

  setRole: (target_id: string, role: 'admin' | 'user') =>
    call<any>('/auth/role', {
      method: 'PUT',
      headers: authH(),
      body: JSON.stringify({ target_id, role })
    }),

  searchUser: (q: string) =>
    call<{ items: any[] }>(`/auth/search?q=${encodeURIComponent(q)}`, { headers: authH() }),

  // ============ 个人资料 ============
  updateProfile: (patch: any) =>
    call<{ profile: any }>('/me/profile', { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
  saveReading: (book: string, chapter: number) =>
    call<{ ok: boolean }>('/me/reading', { method: 'PUT', headers: authH(), body: JSON.stringify({ book, chapter }) }),

  // ============ 书签 ============
  listBookmarks: () => call<{ items: any[] }>('/bookmarks', { headers: authH() }),
  addBookmark: (b: any) => call<{ bookmark: any }>('/bookmarks', { method: 'POST', headers: authH(), body: JSON.stringify(b) }),
  updateBookmark: (id: number, patch: any) =>
    call<{ bookmark: any }>(`/bookmarks/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
  removeBookmark: (id: number) => call<{ ok: boolean }>(`/bookmarks/${id}`, { method: 'DELETE', headers: authH() }),

  // ============ 好友(增强) ============
  listFriends: () =>
    call<{ friends: any[]; requests: any[]; sent: any[] }>('/friends', { headers: authH() }),

  requestFriend: (friend_code: string, message?: string) =>
    call<any>('/friends/request', {
      method: 'POST',
      headers: authH(),
      body: JSON.stringify({ friend_code, message })
    }),

  acceptFriend: (from_id: string) =>
    call<any>('/friends/accept', { method: 'POST', headers: authH(), body: JSON.stringify({ from_id }) }),

  removeFriend: (id: string) =>
    call<any>(`/friends/${id}`, { method: 'DELETE', headers: authH() }),

  setFriendRemark: (id: string, remark: string) =>
    call<any>(`/friends/${id}/remark`, { method: 'PUT', headers: authH(), body: JSON.stringify({ remark }) }),

  friendProfile: (id: string) => call<{ profile: any }>(`/friends/${id}/profile`, { headers: authH() }),

  // ============ 代祷 ============
  createPrayer: (name: string, content: string, visibility = 'friends') =>
    call<{ prayer: any }>('/prayers', { method: 'POST', headers: authH(), body: JSON.stringify({ name, content, visibility }) }),
  myPrayers: () => call<{ items: any[] }>('/prayers/mine', { headers: authH() }),
  friendsPrayers: () => call<{ items: any[] }>('/prayers/friends', { headers: authH() }),
  removePrayer: (id: number) => call<{ ok: boolean }>(`/prayers/${id}`, { method: 'DELETE', headers: authH() }),
  checkinPrayer: (id: number) => call<{ ok: boolean }>(`/prayers/${id}/checkin`, { method: 'POST', headers: authH() }),

  // ============ 群组 ============
  createGroup: (title: string, member_ids: string[]) =>
    call<{ group: any }>('/groups', { method: 'POST', headers: authH(), body: JSON.stringify({ title, member_ids }) }),
  updateGroup: (id: string, patch: any) =>
    call<{ group: any }>(`/groups/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
  setAnnouncement: (id: string, announcement: string) =>
    call<{ group: any }>(`/groups/${id}/announcement`, { method: 'PUT', headers: authH(), body: JSON.stringify({ announcement }) }),
  setMemberRole: (id: string, user_id: string, role: string) =>
    call<{ ok: boolean }>(`/groups/${id}/role`, { method: 'PUT', headers: authH(), body: JSON.stringify({ user_id, role }) }),
  inviteToGroup: (id: string, member_ids: string[]) =>
    call<{ ok: boolean }>(`/groups/${id}/invite`, { method: 'POST', headers: authH(), body: JSON.stringify({ member_ids }) }),
  kickMember: (id: string, uid: string) =>
    call<{ ok: boolean }>(`/groups/${id}/members/${uid}`, { method: 'DELETE', headers: authH() }),
  groupMembers: (id: string) => call<{ members: any[]; group: any }>(`/groups/${id}/members`, { headers: authH() }),
  leaveGroup: (id: string) => call<{ ok: boolean }>(`/groups/${id}/leave`, { method: 'DELETE', headers: authH() }),

  deleteAccount: (token: string) =>
    call<{ ok: boolean }>('/account/delete', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
}
