-- Run this entire file in the SQL editor of your NEW Supabase project.
-- Then create your private admin account in Supabase Authentication > Users.
-- Put that exact admin email into Netlify ADMIN_EMAIL.

create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  parent_name text not null,
  email text not null,
  phone text,
  level text not null,
  programme text default 'Regular Learning',
  notes text,
  vip_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  email text not null,
  phone text,
  topic text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan text not null,
  amount numeric not null,
  status text not null default 'initialized',
  reference text unique not null,
  paystack_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vip_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan text not null,
  days integer not null default 30,
  used boolean not null default false,
  used_by text,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  subject text not null,
  title text not null,
  content text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.inquiries enable row level security;
alter table public.payments enable row level security;
alter table public.vip_codes enable row level security;
alter table public.lessons enable row level security;

-- No public table access is granted. The Netlify Functions use the Supabase
-- server secret only after validating the request. This keeps student/payment
-- data out of the public browser API.

revoke all on public.students from anon, authenticated;
revoke all on public.inquiries from anon, authenticated;
revoke all on public.payments from anon, authenticated;
revoke all on public.vip_codes from anon, authenticated;
revoke all on public.lessons from anon, authenticated;

grant all on public.students to service_role;
grant all on public.inquiries to service_role;
grant all on public.payments to service_role;
grant all on public.vip_codes to service_role;
grant all on public.lessons to service_role;

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant all on public.site_settings to service_role;

insert into public.site_settings(key,value) values
('welcome_eyebrow','WELCOME TO TEACHER NELLY''S YOUNG LEARNERS ACADEMY'),
('welcome_title','Big learning adventures for every young learner.'),
('welcome_text','A safe, joyful place to learn, practise, play and grow.'),
('welcome_button','Open Academy Menu')
on conflict (key) do nothing;
