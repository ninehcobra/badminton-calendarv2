-- Enable PostGIS if you want advanced geo-queries, but for now strict float lat/long is fine for simple usage.

-- 1. Courts Table
create table public.courts (
  id uuid not null default gen_random_uuid(),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  constraint courts_pkey primary key (id)
);

-- Enable RLS
alter table public.courts enable row level security;

-- Policies for Courts
create policy "Courts are viewable by everyone" on public.courts
  for select using (true);

create policy "Authenticated users can create courts" on public.courts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own courts" on public.courts
  for update using (auth.uid() = created_by);

-- 2. Court Reviews Table
create table public.court_reviews (
  id uuid not null default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  constraint court_reviews_pkey primary key (id)
);

-- Enable RLS
alter table public.court_reviews enable row level security;

-- Policies for Reviews
create policy "Reviews are viewable by everyone" on public.court_reviews
  for select using (true);

create policy "Authenticated users can create reviews" on public.court_reviews
  for insert with check (auth.role() = 'authenticated');

-- 3. Realtime
-- Enable realtime for tracking presence (if not already enabled globally)
-- Usually Supabase enables presence on all channels by default, but we might need to enable RLS/Replication for specific tables if we wanted table changes.
-- For "Presence" (Live cursor/location), it's channel-based and doesn't strictly need DB replication.

-- Add Storage bucket for court images if needed later through dashboard.
