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
