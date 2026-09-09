-- pgvector 相似度匹配函数(RAG 检索用)

create or replace function public.match_knowledge_base(
  query_embedding vector(1024),
  match_count int default 5
)
returns table (
  id bigint,
  title text,
  content text,
  source_type kb_source,
  similarity float
)
language sql stable
as $$
  select
    kb.id,
    kb.title,
    kb.content,
    kb.source_type,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and (
      kb.source_type in ('commentary', 'devotional', 'dictionary')
      or kb.owner_id = auth.uid()
    )
  order by kb.embedding <=> query_embedding
  limit match_count;
$$;

-- 给 embedding 列建 HNSW 索引(若 schema 未建)
create index if not exists kb_embedding_hnsw
  on public.knowledge_base using hnsw (embedding vector_cosine_ops);
