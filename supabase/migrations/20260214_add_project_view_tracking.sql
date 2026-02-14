alter table public.site_visits
  drop column if exists project_views;

create table if not exists public.project_view_stats (
  project_id uuid primary key references public.projects(id) on delete cascade,
  views_count bigint not null default 0,
  unique_viewers bigint not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz
);

create table if not exists public.project_view_visitors (
  project_id uuid not null references public.projects(id) on delete cascade,
  visitor_token text not null,
  views_count integer not null default 0,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  primary key (project_id, visitor_token)
);

create index if not exists project_view_stats_views_idx
  on public.project_view_stats (views_count desc);

create index if not exists project_view_stats_last_viewed_idx
  on public.project_view_stats (last_viewed_at desc);

create index if not exists project_view_visitors_token_idx
  on public.project_view_visitors (visitor_token);

create or replace function public.track_project_view(
  p_project_id uuid,
  p_visitor_token text,
  p_viewed_at timestamptz default now()
)
returns void
language plpgsql
security definer
as $$
declare
  v_inserted integer := 0;
begin
  if p_project_id is null then
    return;
  end if;

  if p_visitor_token is null or length(trim(p_visitor_token)) = 0 then
    return;
  end if;

  insert into public.project_view_visitors (
    project_id,
    visitor_token,
    views_count,
    first_viewed_at,
    last_viewed_at
  ) values (
    p_project_id,
    p_visitor_token,
    1,
    p_viewed_at,
    p_viewed_at
  )
  on conflict (project_id, visitor_token) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    update public.project_view_visitors
    set
      views_count = views_count + 1,
      last_viewed_at = greatest(last_viewed_at, p_viewed_at)
    where project_id = p_project_id
      and visitor_token = p_visitor_token;
  end if;

  insert into public.project_view_stats (
    project_id,
    views_count,
    unique_viewers,
    first_viewed_at,
    last_viewed_at
  ) values (
    p_project_id,
    1,
    case when v_inserted = 1 then 1 else 0 end,
    p_viewed_at,
    p_viewed_at
  )
  on conflict (project_id) do update
  set
    views_count = public.project_view_stats.views_count + 1,
    unique_viewers = public.project_view_stats.unique_viewers + case when v_inserted = 1 then 1 else 0 end,
    first_viewed_at = coalesce(public.project_view_stats.first_viewed_at, excluded.first_viewed_at),
    last_viewed_at = greatest(public.project_view_stats.last_viewed_at, excluded.last_viewed_at);
end;
$$;
