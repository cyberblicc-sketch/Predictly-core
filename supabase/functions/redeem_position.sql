-- ============================================================================
-- redeem_position: Early exit from a position
-- Calculates redemption value based on current probability vs entry probability
-- Exit fee: 2% of profit if profit is positive
-- ============================================================================

CREATE OR REPLACE FUNCTION redeem_position(
  p_position_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_position_record RECORD;
  v_market_record RECORD;
  v_yes_pool NUMERIC;
  v_no_pool NUMERIC;
  v_entry_prob NUMERIC;
  v_current_prob NUMERIC;
  v_price_ratio NUMERIC;
  v_gross_value NUMERIC;
  v_profit NUMERIC;
  v_exit_fee NUMERIC;
  v_redemption_value NUMERIC;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_exit_fee_rate NUMERIC := 0.02;
  v_bal_column TEXT;
BEGIN
  -- Get position with lock
  SELECT p.*, m.yes_pool_sc, m.no_pool_sc, m.yes_pool_gc, m.no_pool_gc, m.status as market_status
  INTO v_position_record
  FROM positions p
  JOIN markets m ON p.market_id = m.id
  WHERE p.id = p_position_id AND p.user_id = p_user_id
  FOR UPDATE OF p;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Position not found';
  END IF;

  -- Check if position can be redeemed
  IF v_position_record.is_settled THEN
    RAISE EXCEPTION 'Position is already settled';
  END IF;

  IF v_position_record.is_redeemed THEN
    RAISE EXCEPTION 'Position is already redeemed';
  END IF;

  -- Check market is still active
  IF v_position_record.market_status != 'active' AND v_position_record.market_status != 'paused' THEN
    RAISE EXCEPTION 'Market is no longer active. Status: %', v_position_record.market_status;
  END IF;

  -- Get current pool for this currency
  IF v_position_record.currency = 'sc' THEN
    v_yes_pool := v_position_record.yes_pool_sc;
    v_no_pool := v_position_record.no_pool_sc;
  ELSE
    v_yes_pool := v_position_record.yes_pool_gc;
    v_no_pool := v_position_record.no_pool_gc;
  END IF;

  -- Calculate entry probability (what user bet on)
  IF v_position_record.side = 'yes' THEN
    v_entry_prob := v_position_record.entry_prob;
  ELSE
    v_entry_prob := 1 - v_position_record.entry_prob;
  END IF;

  -- Calculate current probability (for the side the user bet on)
  DECLARE
    v_total_pool NUMERIC := v_yes_pool + v_no_pool;
  BEGIN
    IF v_total_pool > 0 THEN
      IF v_position_record.side = 'yes' THEN
        v_current_prob := v_yes_pool / v_total_pool;
      ELSE
        v_current_prob := v_no_pool / v_total_pool;
      END IF;
    ELSE
      v_current_prob := 0.5;
    END IF;
  END;

  -- Calculate redemption value
  -- Price ratio: how much has the probability moved
  IF v_entry_prob > 0 THEN
    v_price_ratio := v_current_prob / v_entry_prob;
  ELSE
    v_price_ratio := 0;
  END IF;

  v_gross_value := v_position_record.stake * v_price_ratio;
  v_profit := v_gross_value - v_position_record.stake;

  -- Calculate exit fee (only on profit)
  IF v_profit > 0 THEN
    v_exit_fee := v_profit * v_exit_fee_rate;
    v_redemption_value := v_gross_value - v_exit_fee;
  ELSE
    v_exit_fee := 0;
    v_redemption_value := v_gross_value;
  END IF;

  -- Ensure redemption value is not negative
  v_redemption_value := GREATEST(0, v_redemption_value);

  -- Get user's current balance with lock
  v_bal_column := CASE WHEN v_position_record.currency = 'sc' THEN 'sc_balance' ELSE 'gc_balance' END;
  
  EXECUTE format('SELECT %I FROM users WHERE id = $1 FOR UPDATE', v_bal_column)
  INTO v_balance_before
  USING p_user_id;

  -- Calculate new balance
  v_balance_after := v_balance_before + v_redemption_value;

  -- Update user balance
  EXECUTE format('UPDATE users SET %I = $1 WHERE id = $2', v_bal_column)
  USING v_balance_after, p_user_id;

  -- Mark position as redeemed
  UPDATE positions SET
    is_redeemed = TRUE,
    redemption_value = v_redemption_value,
    exit_fee = v_exit_fee,
    redeemed_at = NOW()
  WHERE id = p_position_id;

  -- Log redemption transaction
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
  VALUES (
    p_user_id,
    'EXIT',
    v_redemption_value,
    v_balance_before,
    v_balance_after,
    v_position_record.currency,
    'Early exit: market ' || v_position_record.market_id || ' (position ' || p_position_id || ')',
    'completed',
    v_position_record.market_id,
    p_position_id
  );

  -- Log exit fee if applicable
  IF v_exit_fee > 0 THEN
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
    VALUES (
      p_user_id,
      'FEE_EXIT',
      v_exit_fee,
      v_balance_after,
      v_balance_after,
      v_position_record.currency,
      'Exit fee: market ' || v_position_record.market_id,
      'completed',
      v_position_record.market_id,
      p_position_id
    );
  END IF;

  -- Update market pool (reduce by redemption amount)
  IF v_position_record.side = 'yes' THEN
    IF v_position_record.currency = 'sc' THEN
      UPDATE markets SET yes_pool_sc = yes_pool_sc - v_redemption_value WHERE id = v_position_record.market_id;
    ELSE
      UPDATE markets SET yes_pool_gc = yes_pool_gc - v_redemption_value WHERE id = v_position_record.market_id;
    END IF;
  ELSE
    IF v_position_record.currency = 'sc' THEN
      UPDATE markets SET no_pool_sc = no_pool_sc - v_redemption_value WHERE id = v_position_record.market_id;
    ELSE
      UPDATE markets SET no_pool_gc = no_pool_gc - v_redemption_value WHERE id = v_position_record.market_id;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'position_id', p_position_id,
    'redemption_value', v_redemption_value,
    'exit_fee', v_exit_fee,
    'entry_prob', v_entry_prob,
    'current_prob', v_current_prob,
    'profit', v_profit,
    'new_balance', v_balance_after,
    'currency', v_position_record.currency
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION redeem_position TO authenticated;