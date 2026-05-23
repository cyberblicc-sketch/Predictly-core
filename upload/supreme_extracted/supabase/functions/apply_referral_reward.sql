-- ============================================================================
-- apply_referral_reward: Award referral bonuses to referrer
-- Called when referred user makes their first deposit
-- Awards 20 SC + 20,000 GOLD to referrer
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_referral_reward(
  p_referrer_id UUID,
  p_referred_user_id UUID,
  p_deposit_amount NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_referral_record RECORD;
  v_referrer_record RECORD;
  v_referred_record RECORD;
  v_reward_sc NUMERIC := 20;
  v_reward_gold NUMERIC := 20000;
  v_sc_balance_before NUMERIC;
  v_gc_balance_before NUMERIC;
  v_sc_balance_after NUMERIC;
  v_gc_balance_after NUMERIC;
  v_min_deposit_for_reward NUMERIC := 1;
BEGIN
  -- Validate inputs
  IF p_referrer_id IS NULL OR p_referred_user_id IS NULL THEN
    RAISE EXCEPTION 'Referrer and referred user IDs are required';
  END IF;

  IF p_referrer_id = p_referred_user_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;

  -- Get referrer with lock
  SELECT * INTO v_referrer_record FROM users WHERE id = p_referrer_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referrer not found';
  END IF;

  -- Get referred user
  SELECT * INTO v_referred_record FROM users WHERE id = p_referred_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referred user not found';
  END IF;

  -- Check if referred user has a referred_by_code
  IF v_referred_record.referred_by_code IS NULL THEN
    RAISE EXCEPTION 'Referred user was not referred by anyone';
  END IF;

  -- Check if the referral code matches
  IF v_referred_record.referred_by_code != v_referrer_record.referral_code THEN
    RAISE EXCEPTION 'Referral code mismatch';
  END IF;

  -- Find existing referral record
  SELECT * INTO v_referral_record
  FROM referrals 
  WHERE referrer_id = p_referrer_id 
    AND referred_user_id = p_referred_user_id
  FOR UPDATE;

  -- If no referral record exists, create one
  IF NOT FOUND THEN
    -- Check if deposit meets minimum threshold
    IF p_deposit_amount < v_min_deposit_for_reward THEN
      RAISE EXCEPTION 'Minimum deposit of % required to claim referral reward', v_min_deposit_for_reward;
    END IF;

    -- Create new referral record
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status, deposit_amount, completed_at)
    VALUES (p_referrer_id, p_referred_user_id, v_referrer_record.referral_code, 'completed', p_deposit_amount, NOW())
    RETURNING * INTO v_referral_record;

    -- Award rewards
    v_sc_balance_before := v_referrer_record.sc_balance;
    v_gc_balance_before := v_referrer_record.gc_balance;
    v_sc_balance_after := v_sc_balance_before + v_reward_sc;
    v_gc_balance_after := v_gc_balance_before + v_reward_gold;

    -- Update referrer balances
    UPDATE users SET 
      sc_balance = v_sc_balance_after,
      gc_balance = v_gc_balance_after
    WHERE id = p_referrer_id;

    -- Log SC reward transaction
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, related_user_id)
    VALUES (
      p_referrer_id,
      'REFERRAL_REWARD',
      v_reward_sc,
      v_sc_balance_before,
      v_sc_balance_after,
      'sc',
      'Referral reward: friend deposited SC',
      'completed',
      p_referred_user_id
    );

    -- Log GOLD reward transaction
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, related_user_id)
    VALUES (
      p_referrer_id,
      'GC_BONUS',
      v_reward_gold,
      v_gc_balance_before,
      v_gc_balance_after,
      'gc',
      'Referral bonus: 20,000 GOLD coins',
      'completed',
      p_referred_user_id
    );

    -- Mark referral as completed on user's record
    UPDATE users SET referral_bonus_claimed = TRUE WHERE id = p_referred_user_id;

    RETURN json_build_object(
      'success', TRUE,
      'message', 'Referral reward claimed successfully',
      'reward_sc', v_reward_sc,
      'reward_gold', v_reward_gold,
      'new_sc_balance', v_sc_balance_after,
      'new_gc_balance', v_gc_balance_after
    );
  ELSE
    -- Check if already completed
    IF v_referral_record.status = 'completed' THEN
      RAISE EXCEPTION 'Referral reward already claimed';
    END IF;

    -- Update existing referral record
    UPDATE referrals SET
      status = 'completed',
      deposit_amount = p_deposit_amount,
      completed_at = NOW()
    WHERE id = v_referral_record.id;

    -- Award rewards
    v_sc_balance_before := v_referrer_record.sc_balance;
    v_gc_balance_before := v_referrer_record.gc_balance;
    v_sc_balance_after := v_sc_balance_before + v_reward_sc;
    v_gc_balance_after := v_gc_balance_before + v_reward_gold;

    -- Update referrer balances
    UPDATE users SET 
      sc_balance = v_sc_balance_after,
      gc_balance = v_gc_balance_after
    WHERE id = p_referrer_id;

    -- Log SC reward transaction
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, related_user_id)
    VALUES (
      p_referrer_id,
      'REFERRAL_REWARD',
      v_reward_sc,
      v_sc_balance_before,
      v_sc_balance_after,
      'sc',
      'Referral reward: friend deposited SC',
      'completed',
      p_referred_user_id
    );

    -- Log GOLD reward transaction
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, related_user_id)
    VALUES (
      p_referrer_id,
      'GC_BONUS',
      v_reward_gold,
      v_gc_balance_before,
      v_gc_balance_after,
      'gc',
      'Referral bonus: 20,000 GOLD coins',
      'completed',
      p_referred_user_id
    );

    -- Mark referral as completed on user's record
    UPDATE users SET referral_bonus_claimed = TRUE WHERE id = p_referred_user_id;

    RETURN json_build_object(
      'success', TRUE,
      'message', 'Referral reward claimed successfully',
      'reward_sc', v_reward_sc,
      'reward_gold', v_reward_gold,
      'new_sc_balance', v_sc_balance_after,
      'new_gc_balance', v_gc_balance_after
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION apply_referral_reward TO authenticated;