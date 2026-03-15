-- Cache for AI-generated Duas to avoid redundant API calls
create table if not exists dua_cache (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  language text not null default 'en',
  response jsonb not null,
  created_at timestamptz default now(),
  unique(topic, language)
);

-- Rate limiting: track requests per user per day
create table if not exists dua_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_dua_cache_topic on dua_cache(topic, language);
create index if not exists idx_dua_requests_user_day on dua_requests(user_id, created_at);

-- RLS
alter table dua_cache enable row level security;
alter table dua_requests enable row level security;

-- Anyone authenticated can read from cache
create policy "Authenticated users can read dua cache"
  on dua_cache for select
  to authenticated
  using (true);

-- Service role inserts into cache (via Edge Function)
create policy "Service can insert dua cache"
  on dua_cache for insert
  with check (true);

-- Users can see their own requests
create policy "Users can view own dua requests"
  on dua_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Service role inserts requests
create policy "Service can insert dua requests"
  on dua_requests for insert
  with check (true);
