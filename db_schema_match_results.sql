
-- Create match results
create table public.match_results (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  team_a_ids uuid[] not null, -- Array of user IDs
  team_b_ids uuid[] not null,
  score_a int default 0,
  score_b int default 0,
  elo_change int default 0, -- Points gained by winner/lost by loser
  winner_team text check (winner_team in ('A', 'B')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.match_results enable row level security;
create policy "Viewable by everyone" on match_results for select using (true);
create policy "Creators can insert results" on match_results for insert with check (auth.uid() = (select created_by from events where id = event_id));
