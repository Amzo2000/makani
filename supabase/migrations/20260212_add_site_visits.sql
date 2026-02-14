create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_token text not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  visits_count integer not null default 1,
  last_path text,
  user_agent text
);

create index if not exists site_visits_first_seen_at_idx
  on public.site_visits (first_seen_at desc);

create index if not exists site_visits_last_seen_at_idx
  on public.site_visits (last_seen_at desc);
