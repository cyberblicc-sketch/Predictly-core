-- ============================================================================
-- redeem_kyc: Process KYC redemption request
-- User must be KYC verified
-- Minimum redemption: 50 SC for gift cards, 60 SC for regular methods
-- Converts SC to USD at rate: 1 SC = $0.01 (configurable)
-- ============================================================================

CREATE OR REPLACE FUNCTION redeem_kyc(
  p_user_id UUID,
  p_amount_sc NUMERIC,
  p_method TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_record RECORD;
  v_min_sc_gift_card NUMERIC := 50;
  v_min_sc_regular NUMERIC := 60;
  v_sc_to_usd_rate NUMERIC := 0.01;
  v_amount_usd NUMERIC;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_redemption_record RECORD;
BEGIN
  -- Validate inputs
  IF p_amount_sc <= 0 THEN
    RAISE EXCEPTION 'Redemption amount must be positive';
  END IF;

  IF p_method NOT IN ('ach', 'check', 'paypal', 'gift_card') THEN
    RAISE EXCEPTION 'Invalid redemption method. Must be ach, check, paypal, or gift_card';
  END IF;

  -- Get user with lock
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check KYC status
  IF v_user_record.kyc_status != 'verified' THEN
    RAISE EXCEPTION 'KYC verification required. Current status: %', v_user_record.kyc_status;
  END IF;

  -- Check minimum redemption based on method
  IF p_method = 'gift_card' THEN
    IF p_amount_sc < v_min_sc_gift_card THEN
      RAISE EXCEPTION 'Minimum redemption for gift cards is % SC', v_min_sc_gift_card;
    END IF;
  ELSE
    IF p_amount_sc < v_min_sc_regular THEN
      RAISE EXCEPTION 'Minimum redemption for % is % SC', p_method, v_min_sc_regular;
    END IF;
  END IF;

  -- Check SC balance
  v_balance_before := v_user_record.sc_balance;
  IF v_balance_before < p_amount_sc THEN
    RAISE EXCEPTION 'Insufficient SC balance. Available: %, Required: %', v_balance_before, p_amount_sc;
  END IF;

  -- Check self-exclusion
  IF v_user_record.self_excluded THEN
    IF v_user_record.exclusion_until IS NULL OR v_user_record.exclusion_until > NOW() THEN
      RAISE EXCEPTION 'Account is self-excluded until %', v_user_record.exclusion_until;
    END IF;
  END IF;

  -- Check if restricted
  IF v_user_record.is_restricted THEN
    RAISE EXCEPTION 'Account is restricted';
  END IF;

  -- Calculate USD amount
  v_amount_usd := p_amount_sc * v_sc_to_usd_rate;

  -- Deduct SC from balance
  v_balance_after := v_balance_before - p_amount_sc;
  
  UPDATE users SET sc_balance = v_balance_after WHERE id = p_user_id;

  -- Create redemption request
  INSERT INTO redemption_requests (user_id, amount_sc, amount_usd, status, method, created_at, updated_at)
  VALUES (p_user_id, p_amount_sc, v_amount_usd, 'pending', p_method, NOW(), NOW())
  RETURNING * INTO v_redemption_record;

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, metadata)
  VALUES (
    p_user_id,
    'REDEMPTION_REQUEST',
    p_amount_sc,
    v_balance_before,
    v_balance_after,
    'sc',
    'Redemption request: ' || p_amount_sc || ' SC → $' || v_amount_usd || ' (' || p_method || ')',
    'completed',
    json_build_object(
      'redemption_id', v_redemption_record.id,
      'method', p_method,
      'amount_usd', v_amount_usd
    )
  );

  RETURN json_build_object(
    'success', TRUE,
    'redemption_id', v_redemption_record.id,
    'amount_sc', p_amount_sc,
    'amount_usd', v_amount_usd,
    'method', p_method,
    'new_balance', v_balance_after,
    'status', 'pending',
    'message', 'Redemption request submitted successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION redeem_kyc TO authenticated;