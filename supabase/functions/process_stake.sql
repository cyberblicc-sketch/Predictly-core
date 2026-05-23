-- ============================================================================
-- process_stake: Atomic stake placement with FOR UPDATE row locking
-- Handles both SC and GC positions with LMSR bootstrapping
-- Fee structure: 2% protocol + 1% publisher = 3% total on resolution
-- ============================================================================

CREATE OR REPLACE FUNCTION process_stake(
  p_user_id UUID,
  p_market_id TEXT,
  p_side TEXT,
  p_amount NUMERIC,
  p_currency TEXT
) RETURNS JSON AS $$
DECLARE
  v_current_sc NUMERIC;
  v_current_gc NUMERIC;
  v_yes_pool NUMERIC;
  v_no_pool NUMERIC;
  v_cost NUMERIC;
  v_entry_prob NUMERIC;
  v_lmsr_subsidy NUMERIC := 0;
  v_new_balance NUMERIC;
  v_position_id UUID;
  v_fee_rate NUMERIC := 0.03;
  v_protocol_fee_rate NUMERIC := 0.02;
  v_publisher_fee_rate NUMERIC := 0.01;
  v_lmsr_threshold NUMERIC := 100;
  v_lmsr_b NUMERIC := 50;
  v_market_record RECORD;
  v_user_record RECORD;
  v_total_pool NUMERIC;
  v_new_yes_pool NUMERIC;
  v_new_no_pool NUMERIC;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF p_side NOT IN ('yes', 'no') THEN
    RAISE EXCEPTION 'Side must be yes or no';
  END IF;
  
  IF p_currency NOT IN ('sc', 'gc') THEN
    RAISE EXCEPTION 'Currency must be sc or gc';
  END IF;

  -- Get user with lock
  SELECT id, sc_balance, gc_balance, self_excluded, exclusion_until, is_restricted
  INTO v_user_record
  FROM users WHERE id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check self-exclusion
  IF v_user_record.self_excluded THEN
    IF v_user_record.exclusion_until IS NULL OR v_user_record.exclusion_until > NOW() THEN
      RAISE EXCEPTION 'Account is self-excluded';
    END IF;
  END IF;
  
  -- Check if restricted
  IF v_user_record.is_restricted THEN
    RAISE EXCEPTION 'Account is restricted';
  END IF;

  -- Check balance
  IF p_currency = 'sc' THEN
    v_current_sc := v_user_record.sc_balance;
    IF v_current_sc < p_amount THEN
      RAISE EXCEPTION 'Insufficient SC balance. Available: %', v_current_sc;
    END IF;
  ELSE
    v_current_gc := v_user_record.gc_balance;
    IF v_current_gc < p_amount THEN
      RAISE EXCEPTION 'Insufficient GC balance. Available: %', v_current_gc;
    END IF;
  END IF;

  -- Get market with lock
  SELECT * INTO v_market_record
  FROM markets WHERE id = p_market_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found';
  END IF;
  
  IF v_market_record.status != 'active' THEN
    RAISE EXCEPTION 'Market is not active. Status: %', v_market_record.status;
  END IF;
  
  IF v_market_record.expires_at IS NOT NULL AND v_market_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'Market has expired';
  END IF;

  -- Get pools for this currency
  IF p_currency = 'sc' THEN
    v_yes_pool := v_market_record.yes_pool_sc;
    v_no_pool := v_market_record.no_pool_sc;
  ELSE
    v_yes_pool := v_market_record.yes_pool_gc;
    v_no_pool := v_market_record.no_pool_gc;
  END IF;
  
  v_total_pool := v_yes_pool + v_no_pool;

  -- Calculate cost using LMSR or parimutuel based on pool size
  IF v_total_pool < v_lmsr_threshold THEN
    -- LMSR mode (bootstrapping)
    -- Cost = B * log(exp(k_yes/B) + exp(k_no/B)) where k is pool after adding stake
    DECLARE
      v_exp REAL;
      v_cost_yes NUMERIC;
      v_cost_no NUMERIC;
      v_new_yes NUMERIC;
      v_new_no NUMERIC;
    BEGIN
      -- Calculate cost for YES side
      v_new_yes := v_yes_pool + p_amount;
      v_new_no := v_no_pool;
      v_cost_yes := v_lmsr_b * LN(EXP(v_new_yes / v_lmsr_b) + EXP(v_new_no / v_lmsr_b)) -
                    v_lmsr_b * LN(EXP(v_yes_pool / v_lmsr_b) + EXP(v_no_pool / v_lmsr_b));
      
      -- Calculate cost for NO side
      v_new_yes := v_yes_pool;
      v_new_no := v_no_pool + p_amount;
      v_cost_no := v_lmsr_b * LN(EXP(v_new_yes / v_lmsr_b) + EXP(v_new_no / v_lmsr_b)) -
                    v_lmsr_b * LN(EXP(v_yes_pool / v_lmsr_b) + EXP(v_no_pool / v_lmsr_b));
      
      IF p_side = 'yes' THEN
        v_cost := v_cost_yes;
      ELSE
        v_cost := v_cost_no;
      END IF;
      
      v_lmsr_subsidy := p_amount - v_cost;
    END;
  ELSE
    -- Parimutuel mode
    v_cost := p_amount;
  END IF;

  -- Calculate entry probability (implied probability BEFORE this trade)
  IF v_total_pool > 0 THEN
    v_entry_prob := CASE WHEN p_side = 'yes' THEN v_yes_pool / v_total_pool ELSE v_no_pool / v_total_pool END;
  ELSE
    v_entry_prob := 0.5;
  END IF;

  -- Deduct balance
  IF p_currency = 'sc' THEN
    v_new_balance := v_current_sc - v_cost;
    UPDATE users SET sc_balance = v_new_balance, total_wagered_sc = total_wagered_sc + p_amount WHERE id = p_user_id;
  ELSE
    v_new_balance := v_current_gc - v_cost;
    UPDATE users SET gc_balance = v_new_balance, total_wagered_gc = total_wagered_gc + p_amount WHERE id = p_user_id;
  END IF;

  -- Update market pools
  IF p_side = 'yes' THEN
    IF p_currency = 'sc' THEN
      UPDATE markets SET
        yes_pool_sc = yes_pool_sc + p_amount,
        total_volume_sc = total_volume_sc + p_amount,
        total_traders = total_traders + 1,
        lmsr_active = (yes_pool_sc + no_pool_sc + p_amount) < v_lmsr_threshold
      WHERE id = p_market_id;
      v_new_yes_pool := v_yes_pool + p_amount;
      v_new_no_pool := v_no_pool;
    ELSE
      UPDATE markets SET
        yes_pool_gc = yes_pool_gc + p_amount,
        total_volume_gc = total_volume_gc + p_amount,
        total_traders = total_traders + 1
      WHERE id = p_market_id;
      v_new_yes_pool := v_yes_pool + p_amount;
      v_new_no_pool := v_no_pool;
    END IF;
  ELSE
    IF p_currency = 'sc' THEN
      UPDATE markets SET
        no_pool_sc = no_pool_sc + p_amount,
        total_volume_sc = total_volume_sc + p_amount,
        total_traders = total_traders + 1,
        lmsr_active = (yes_pool_sc + no_pool_sc + p_amount) < v_lmsr_threshold
      WHERE id = p_market_id;
      v_new_yes_pool := v_yes_pool;
      v_new_no_pool := v_no_pool + p_amount;
    ELSE
      UPDATE markets SET
        no_pool_gc = no_pool_gc + p_amount,
        total_volume_gc = total_volume_gc + p_amount,
        total_traders = total_traders + 1
      WHERE id = p_market_id;
      v_new_yes_pool := v_yes_pool;
      v_new_no_pool := v_no_pool + p_amount;
    END IF;
  END IF;

  -- Update probability
  IF p_currency = 'sc' THEN
    UPDATE markets SET
      yes_probability = CASE WHEN (yes_pool_sc + no_pool_sc) > 0 THEN yes_pool_sc / (yes_pool_sc + no_pool_sc) ELSE 0.5 END,
      no_probability = CASE WHEN (yes_pool_sc + no_pool_sc) > 0 THEN no_pool_sc / (yes_pool_sc + no_pool_sc) ELSE 0.5 END
    WHERE id = p_market_id;
  ELSE
    UPDATE markets SET
      yes_probability = CASE WHEN (yes_pool_gc + no_pool_gc) > 0 THEN yes_pool_gc / (yes_pool_gc + no_pool_gc) ELSE 0.5 END,
      no_probability = CASE WHEN (yes_pool_gc + no_pool_gc) > 0 THEN no_pool_gc / (yes_pool_gc + no_pool_gc) ELSE 0.5 END
    WHERE id = p_market_id;
  END IF;

  -- Create position
  INSERT INTO positions (user_id, market_id, side, currency, stake, entry_prob, cost, lmsr_subsidy)
  VALUES (p_user_id, p_market_id, p_side, p_currency, p_amount, v_entry_prob, v_cost, v_lmsr_subsidy)
  RETURNING id INTO v_position_id;

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
  VALUES (
    p_user_id,
    'STAKE',
    v_cost,
    CASE WHEN p_currency = 'sc' THEN v_current_sc ELSE v_current_gc END,
    v_new_balance,
    p_currency,
    'Stake on market ' || p_market_id || ' (' || p_side || ')',
    'completed',
    p_market_id,
    v_position_id
  );

  RETURN json_build_object(
    'position_id', v_position_id,
    'cost', v_cost,
    'entry_prob', v_entry_prob,
    'new_balance', v_new_balance,
    'lmsr_subsidy', v_lmsr_subsidy,
    'side', p_side,
    'currency', p_currency
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_stake TO authenticated;