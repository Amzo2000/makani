alter table public.site_visits
  add column if not exists last_referrer text,
  add column if not exists last_language text,
  add column if not exists last_timezone text,
  add column if not exists last_screen text,
  add column if not exists last_utm_source text,
  add column if not exists last_utm_medium text,
  add column if not exists last_utm_campaign text,
  add column if not exists last_utm_term text,
  add column if not exists last_utm_content text,
  add column if not exists ip_hash text,
  add column if not exists device_type text;

create table if not exists public.site_visit_events (
  id uuid primary key default gen_random_uuid(),
  visitor_token text not null,
  visited_at timestamptz not null default now(),
  path text not null,
  referrer text,
  user_agent text,
  ip_hash text,
  language text,
  timezone text,
  screen text,
  device_type text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text
);

create index if not exists site_visit_events_visited_at_idx
  on public.site_visit_events (visited_at desc);

create index if not exists site_visit_events_visitor_token_idx
  on public.site_visit_events (visitor_token);

create index if not exists site_visit_events_path_idx
  on public.site_visit_events (path);
