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
const token = () => localStorage.getItem('sb_token') || '';
const authH = () => ({ Authorization: `Bearer ${token()}` });
export const api = {
    searchVerses: (q, page = 1, limit = 50) => call(`/bible/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
    searchPersons: (q, page = 1, limit = 50) => call(`/persons${q ? `?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`}`),
    readChapter: (book, chapter) => call(`/bible/${book}/${chapter}`),
    listBooks: () => call(`/bible/books`),
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
    // ============ AI 历史 ============
    aiHistory: () => call('/ai/history', { headers: authH() }),
    clearAiHistory: () => call('/ai/history', { method: 'DELETE', headers: authH() }),
    // ============ 账号 ============
    register: (username, password, invite_code) => call('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, invite_code })
    }),
    login: (username, password) => call('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    }),
    me: () => call('/auth/me', { headers: authH() }),
    changeInviteCode: (invite_code, target_id) => call('/auth/invite-code', {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ invite_code, target_id })
    }),
    setRole: (target_id, role) => call('/auth/role', {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ target_id, role })
    }),
    searchUser: (q) => call(`/auth/search?q=${encodeURIComponent(q)}`, { headers: authH() }),
    // ============ 个人资料 ============
    updateProfile: (patch) => call('/me/profile', { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
    saveReading: (book, chapter) => call('/me/reading', { method: 'PUT', headers: authH(), body: JSON.stringify({ book, chapter }) }),
    // ============ 书签 ============
    listBookmarks: () => call('/bookmarks', { headers: authH() }),
    addBookmark: (b) => call('/bookmarks', { method: 'POST', headers: authH(), body: JSON.stringify(b) }),
    updateBookmark: (id, patch) => call(`/bookmarks/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
    removeBookmark: (id) => call(`/bookmarks/${id}`, { method: 'DELETE', headers: authH() }),
    // ============ 好友(增强) ============
    listFriends: () => call('/friends', { headers: authH() }),
    requestFriend: (friend_code, message) => call('/friends/request', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ friend_code, message })
    }),
    acceptFriend: (from_id) => call('/friends/accept', { method: 'POST', headers: authH(), body: JSON.stringify({ from_id }) }),
    removeFriend: (id) => call(`/friends/${id}`, { method: 'DELETE', headers: authH() }),
    setFriendRemark: (id, remark) => call(`/friends/${id}/remark`, { method: 'PUT', headers: authH(), body: JSON.stringify({ remark }) }),
    friendProfile: (id) => call(`/friends/${id}/profile`, { headers: authH() }),
    // ============ 代祷 ============
    createPrayer: (name, content, visibility = 'friends') => call('/prayers', { method: 'POST', headers: authH(), body: JSON.stringify({ name, content, visibility }) }),
    myPrayers: () => call('/prayers/mine', { headers: authH() }),
    friendsPrayers: () => call('/prayers/friends', { headers: authH() }),
    removePrayer: (id) => call(`/prayers/${id}`, { method: 'DELETE', headers: authH() }),
    checkinPrayer: (id) => call(`/prayers/${id}/checkin`, { method: 'POST', headers: authH() }),
    // ============ 群组 ============
    createGroup: (title, member_ids) => call('/groups', { method: 'POST', headers: authH(), body: JSON.stringify({ title, member_ids }) }),
    updateGroup: (id, patch) => call(`/groups/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }),
    setAnnouncement: (id, announcement) => call(`/groups/${id}/announcement`, { method: 'PUT', headers: authH(), body: JSON.stringify({ announcement }) }),
    setMemberRole: (id, user_id, role) => call(`/groups/${id}/role`, { method: 'PUT', headers: authH(), body: JSON.stringify({ user_id, role }) }),
    inviteToGroup: (id, member_ids) => call(`/groups/${id}/invite`, { method: 'POST', headers: authH(), body: JSON.stringify({ member_ids }) }),
    kickMember: (id, uid) => call(`/groups/${id}/members/${uid}`, { method: 'DELETE', headers: authH() }),
    groupMembers: (id) => call(`/groups/${id}/members`, { headers: authH() }),
    leaveGroup: (id) => call(`/groups/${id}/leave`, { method: 'DELETE', headers: authH() }),
    deleteAccount: (token) => call('/account/delete', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
};
