-- Create a table for public profiles (extends default auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  avatar_url text,
  rank_score int default 1000,
  rank_tier text default 'Iron IV',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  location text,
  event_type text check (event_type in ('direct', 'vote')),
  start_time timestamp with time zone, -- Nullable if it's a vote type initially
  end_time timestamp with time zone,
  created_by uuid references public.profiles(id) not null,
  status text default 'planning' check (status in ('planning', 'confirmed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for events
alter table public.events enable row level security;

create policy "Events are viewable by everyone" on events for select using (true);
create policy "Authenticated users can create events" on events for insert with check (auth.role() = 'authenticated');
create policy "Creators can update their events" on events for update using (auth.uid() = created_by);

-- Create event options for voting
create table public.event_options (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_options enable row level security;
create policy "Viewable by everyone" on event_options for select using (true);
create policy "Creators can add options" on event_options for insert with check (auth.uid() = (select created_by from events where id = event_id));

-- Create votes
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  option_id uuid references public.event_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(option_id, user_id)
);

alter table public.votes enable row level security;
create policy "Viewable by everyone" on votes for select using (true);
create policy "Authenticated users can vote" on votes for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own vote" on votes for delete using (auth.uid() = user_id);

-- Create participants
create table public.event_participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

alter table public.event_participants enable row level security;
create policy "Viewable by everyone" on event_participants for select using (true);
create policy "Users can join/leave" on event_participants for insert with check (auth.role() = 'authenticated');
create policy "Users can update status" on event_participants for update using (auth.uid() = user_id);

-- Trigger to create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Match Results Table
create table public.match_results (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  team_a_ids uuid[] not null,
  team_b_ids uuid[] not null,
  score_a int default 0,
  score_b int default 0,
  elo_change int default 0,
  winner_team text check (winner_team in ('A', 'B')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.match_results enable row level security;
create policy "Viewable by everyone" on match_results for select using (true);
create policy "Creators can insert results" on match_results for insert with check (auth.uid() = (select created_by from events where id = event_id));

-- RPC to record match and update ELO
create or replace function public.finish_match(
  p_event_id uuid,
  p_team_a uuid[],
  p_team_b uuid[],
  p_score_a int,
  p_score_b int,
  p_elo_change int
)
returns void as $$
declare
  v_winner text;
  v_user_id uuid;
begin
  -- Determine winner
  if p_score_a > p_score_b then
    v_winner := 'A';
  else
    v_winner := 'B';
  end if;

  -- Insert match result
  insert into public.match_results (event_id, team_a_ids, team_b_ids, score_a, score_b, elo_change, winner_team)
  values (p_event_id, p_team_a, p_team_b, p_score_a, p_score_b, p_elo_change, v_winner);

  -- Update Team A
  foreach v_user_id in array p_team_a
  loop
    update public.profiles
    set rank_score = rank_score + (case when v_winner = 'A' then p_elo_change else -p_elo_change end)
    where id = v_user_id;
  end loop;

  -- Update Team B
  foreach v_user_id in array p_team_b
  loop
    update public.profiles
    set rank_score = rank_score + (case when v_winner = 'B' then p_elo_change else -p_elo_change end)
    where id = v_user_id;
  end loop;
end;
$$ language plpgsql security definer;
