-- 1. Create Helper Function to Determine Rank Tier (Vietnamese)
CREATE OR REPLACE FUNCTION public.get_rank_tier(score int)
RETURNS text AS $$
BEGIN
    -- Iron (< 1200)
    IF score < 1050 THEN RETURN 'Sắt IV'; END IF;
    IF score < 1100 THEN RETURN 'Sắt III'; END IF;
    IF score < 1150 THEN RETURN 'Sắt II'; END IF;
    IF score < 1200 THEN RETURN 'Sắt I'; END IF;

    -- Bronze (1200 - 1399)
    IF score < 1250 THEN RETURN 'Đồng IV'; END IF;
    IF score < 1300 THEN RETURN 'Đồng III'; END IF;
    IF score < 1350 THEN RETURN 'Đồng II'; END IF;
    IF score < 1400 THEN RETURN 'Đồng I'; END IF;

    -- Silver (1400 - 1599)
    IF score < 1450 THEN RETURN 'Bạc IV'; END IF;
    IF score < 1500 THEN RETURN 'Bạc III'; END IF;
    IF score < 1550 THEN RETURN 'Bạc II'; END IF;
    IF score < 1600 THEN RETURN 'Bạc I'; END IF;

    -- Gold (1600 - 1799)
    IF score < 1650 THEN RETURN 'Vàng IV'; END IF;
    IF score < 1700 THEN RETURN 'Vàng III'; END IF;
    IF score < 1750 THEN RETURN 'Vàng II'; END IF;
    IF score < 1800 THEN RETURN 'Vàng I'; END IF;

    -- Platinum (1800 - 1999)
    IF score < 1850 THEN RETURN 'Bạch Kim IV'; END IF;
    IF score < 1900 THEN RETURN 'Bạch Kim III'; END IF;
    IF score < 1950 THEN RETURN 'Bạch Kim II'; END IF;
    IF score < 2000 THEN RETURN 'Bạch Kim I'; END IF;

    -- Diamond (2000 - 2199)
    IF score < 2050 THEN RETURN 'Kim Cương IV'; END IF;
    IF score < 2100 THEN RETURN 'Kim Cương III'; END IF;
    IF score < 2150 THEN RETURN 'Kim Cương II'; END IF;
    IF score < 2200 THEN RETURN 'Kim Cương I'; END IF;

    -- Challenger (2200+)
    RETURN 'Thách Đấu';
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- 2. Update finish_match to automatically update rank_tier
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
  v_new_score int;
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
    SET rank_score = rank_score + (CASE WHEN v_winner = 'A' THEN p_elo_change ELSE -p_elo_change END),
        rank_tier = public.get_rank_tier(rank_score + (CASE WHEN v_winner = 'A' THEN p_elo_change ELSE -p_elo_change END))
    WHERE id = v_user_id;
  END LOOP;

  -- Update Team B
  FOREACH v_user_id IN ARRAY p_team_b
  LOOP
    UPDATE public.profiles
    SET rank_score = rank_score + (CASE WHEN v_winner = 'B' THEN p_elo_change ELSE -p_elo_change END),
        rank_tier = public.get_rank_tier(rank_score + (CASE WHEN v_winner = 'B' THEN p_elo_change ELSE -p_elo_change END))
    WHERE id = v_user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing users (calculate tier based on current score)
UPDATE public.profiles
SET rank_tier = public.get_rank_tier(rank_score);
