-- 1. Fix Trigger for New Users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Match Results Table (Update Schema)
CREATE TABLE IF NOT EXISTS public.match_results (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  team_a_ids uuid[] not null,
  team_b_ids uuid[] not null,
  score_a int default 0,
  score_b int default 0,
  elo_change int default 0,
  winner_team text check (winner_team in ('A', 'B')),
  set_scores text, -- New column for detailed scores (e.g. "21-15, 18-21, 21-19")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADD COLUMN IF NOT EXISTS (for safety if table already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_results' AND column_name = 'set_scores') THEN
        ALTER TABLE public.match_results ADD COLUMN set_scores text;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Re-create safely)
DROP POLICY IF EXISTS "Viewable by everyone" ON match_results;
CREATE POLICY "Viewable by everyone" ON match_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can insert results" ON match_results;
CREATE POLICY "Creators can insert results" ON match_results FOR INSERT WITH CHECK (auth.uid() = (select created_by from events where id = event_id));

-- 5. Create/Update RPC function for Finishing Matches
CREATE OR REPLACE FUNCTION public.finish_match(
  p_event_id uuid,
  p_team_a uuid[],
  p_team_b uuid[],
  p_score_a int,
  p_score_b int,
  p_elo_change int,
  p_set_scores text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_winner text;
  v_user_id uuid;
BEGIN
  -- Determine winner
  IF p_score_a > p_score_b THEN
    v_winner := 'A';
  ELSE
    v_winner := 'B';
  END IF;

  -- Insert match result
  INSERT INTO public.match_results (event_id, team_a_ids, team_b_ids, score_a, score_b, elo_change, winner_team, set_scores)
  VALUES (p_event_id, p_team_a, p_team_b, p_score_a, p_score_b, p_elo_change, v_winner, p_set_scores);

  -- Update Team A
  FOREACH v_user_id IN ARRAY p_team_a
  LOOP
    UPDATE public.profiles
    SET rank_score = rank_score + (CASE WHEN v_winner = 'A' THEN p_elo_change ELSE -p_elo_change END)
    WHERE id = v_user_id;
  END LOOP;

  -- Update Team B
  FOREACH v_user_id IN ARRAY p_team_b
  LOOP
    UPDATE public.profiles
    SET rank_score = rank_score + (CASE WHEN v_winner = 'B' THEN p_elo_change ELSE -p_elo_change END)
    WHERE id = v_user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Backfill Default ELO for Existing Users (Safe to re-run)
UPDATE public.profiles
SET rank_score = 1000, rank_tier = 'Iron IV'
WHERE rank_score IS NULL OR rank_score = 0;

-- 7. Policy for Joining Events (Users can insert themselves)
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can join events" ON event_participants;
CREATE POLICY "Users can join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: 'user_id' is the column name in event_participants table that usually refers to the participant.

DROP POLICY IF EXISTS "Participants viewable by everyone" ON event_participants;
CREATE POLICY "Participants viewable by everyone" ON event_participants FOR SELECT USING (true);
