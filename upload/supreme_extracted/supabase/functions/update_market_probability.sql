-- ============================================================================
-- update_market_probability: Recalculate market odds based on pool ratios
-- Should be called after any stake placement or redemption
-- Updates yes_probability and no_probability columns
-- Also updates lmsr_active flag based on pool threshold
-- ============================================================================

CREATE OR REPLACE FUNCTION update_market_probability(
  p_market_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_market_record RECORD;
  v_yes_pool_sc NUMERIC;
  v_no_pool_sc NUMERIC;
  v_yes_pool_gc NUMERIC;
  v_no_pool_gc NUMERIC;
  v_total_sc NUMERIC;
  v_total_gc NUMERIC;
  v_lmsr_threshold NUMERIC := 100;
  v_new_yes_prob NUMERIC;
  v_new_no_prob NUMERIC;
  v_updated BOOLEAN := FALSE;
BEGIN
  -- Get market with lock
  SELECT * INTO v_market_record FROM markets WHERE id = p_market_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found';
  END IF;

  v_yes_pool_sc := v_market_record.yes_pool_sc;
  v_no_pool_sc := v_market_record.no_pool_sc;
  v_yes_pool_gc := v_market_record.yes_pool_gc;
  v_no_pool_gc := v_market_record.no_pool_gc;

  -- Calculate SC-based probability (primary)
  v_total_sc := v_yes_pool_sc + v_no_pool_sc;
  
  IF v_total_sc > 0 THEN
    v_new_yes_prob := v_yes_pool_sc / v_total_sc;
    v_new_no_prob := v_no_pool_sc / v_total_sc;
  ELSE
    v_new_yes_prob := 0.5;
    v_new_no_prob := 0.5;
  END IF;

  -- Check if LMSR mode should be active (total SC pool below threshold)
  DECLARE
    v_lmsr_active BOOLEAN := v_total_sc < v_lmsr_threshold;
  BEGIN
    -- Update market with new probabilities and LMSR flag
    UPDATE markets SET
      yes_probability = v_new_yes_prob,
      no_probability = v_new_no_prob,
      lmsr_active = v_lmsr_active,
      updated_at = NOW()
    WHERE id = p_market_id;
    
    v_updated := TRUE;
  END;

  RETURN json_build_object(
    'success', TRUE,
    'market_id', p_market_id,
    'yes_probability', v_new_yes_prob,
    'no_probability', v_new_no_prob,
    'total_pool_sc', v_total_sc,
    'lmsr_active', v_total_sc < v_lmsr_threshold,
    'updated', v_updated
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_market_probability TO authenticated;