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

  deleteAccount: (token: string) =>
    call<{ ok: boolean }>('/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
}
