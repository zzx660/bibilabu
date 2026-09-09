const base = import.meta.env.VITE_API_BASE || '/api';
async function call(path, init) {
    const r = await fetch(base + path, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    });
    if (!r.ok)
        throw new Error(`${r.status} ${await r.text().catch(() => '')}`);
    return r.json();
}
export const api = {
    searchVerses: (q, limit = 50) => call(`/bible/search?q=${encodeURIComponent(q)}&limit=${limit}`),
    readChapter: (book, chapter) => call(`/bible/${book}/${chapter}`),
    listBooks: () => call(`/bible/books`),
    searchPersons: (q) => call(`/persons${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    personDetail: (id) => call(`/persons/${id}`),
    askGlm: (question, context) => call('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question, context })
    }),
    explainVerse: (verse) => call('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ verse })
    }),
    ragAsk: (question) => call('/ai/rag', {
        method: 'POST',
        body: JSON.stringify({ question })
    }),
    kbSearch: (query) => call('/kb/search', {
        method: 'POST',
        body: JSON.stringify({ query })
    }),
    // ============ 账号 ============
    register: (username, password, invite_code) => call('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, invite_code })
    }),
    login: (username, password) => call('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    }),
    me: () => call('/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` } }),
    changeInviteCode: (invite_code, target_id) => call('/auth/invite-code', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
        body: JSON.stringify({ invite_code, target_id })
    }),
    setRole: (target_id, role) => call('/auth/role', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
        body: JSON.stringify({ target_id, role })
    }),
    searchUser: (q) => call(`/auth/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),
    // ============ 好友 ============
    listFriends: () => call('/friends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),
    requestFriend: (friend_code) => call('/friends/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
        body: JSON.stringify({ friend_code })
    }),
    acceptFriend: (from_id) => call('/friends/accept', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` },
        body: JSON.stringify({ from_id })
    }),
    removeFriend: (id) => call(`/friends/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sb_token') || ''}` }
    }),
    deleteAccount: (token) => call('/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    })
};
