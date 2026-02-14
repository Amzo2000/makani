create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label jsonb not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_sort_order_idx
  on public.categories (sort_order asc, created_at asc);

insert into public.categories (key, label, sort_order, is_active)
values
  ('Residential', '{"en":"Residential","fr":"Résidentiel","ar":"سكني"}'::jsonb, 10, true),
  ('Commercial', '{"en":"Commercial","fr":"Commercial","ar":"تجاري"}'::jsonb, 20, true),
  ('Interior', '{"en":"Interior","fr":"Intérieur","ar":"داخلي"}'::jsonb, 30, true),
  ('Cultural', '{"en":"Cultural","fr":"Culturel","ar":"ثقافي"}'::jsonb, 40, true),
  ('Concept', '{"en":"Concept","fr":"Concept","ar":"مفهوم"}'::jsonb, 50, true)
on conflict (key) do nothing;
