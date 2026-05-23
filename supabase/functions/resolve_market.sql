-- ============================================================================
-- resolve_market: Resolve a market and settle all positions
-- Calculates payouts for winners proportionally to their stake
-- Distributes fees to protocol and publisher
-- ============================================================================

CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id TEXT,
  p_outcome TEXT,
  p_resolution_source TEXT,
  p_admin_id UUID
) RETURNS JSON AS $$
DECLARE
  v_market_record RECORD;
  v_fee_rate NUMERIC := 0.03;
  v_protocol_fee_rate NUMERIC := 0.02;
  v_publisher_fee_rate NUMERIC := 0.01;
  v_total_protocol_fee NUMERIC := 0;
  v_total_publisher_fee NUMERIC := 0;
  v_position RECORD;
  v_payout NUMERIC;
  v_new_balance NUMERIC;
  v_balance_before NUMERIC;
  v_settled_count INTEGER := 0;
  v_total_payout NUMERIC := 0;
  v_referral_record RECORD;
  v_referrer_record RECORD;
BEGIN
  -- Validate outcome
  IF p_outcome NOT IN ('yes', 'no', 'invalid', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome. Must be yes, no, invalid, or cancel';
  END IF;

  -- Get market with lock
  SELECT * INTO v_market_record FROM markets WHERE id = p_market_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found';
  END IF;
  
  IF v_market_record.status != 'active' AND v_market_record.status != 'paused' THEN
    RAISE EXCEPTION 'Market is not active or paused. Current status: %', v_market_record.status;
  END IF;

  -- Update market status
  UPDATE markets SET
    status = 'resolved',
    resolution = p_outcome,
    resolution_date = NOW(),
    resolution_evidence = p_resolution_source,
    resolving_admin_id = p_admin_id,
    updated_at = NOW()
  WHERE id = p_market_id;

  -- Log admin action
  INSERT INTO admin_logs (admin_id, action, target_market_id, changes, reason)
  VALUES (
    p_admin_id,
    'resolve_market',
    p_market_id,
    json_build_object(
      'outcome', p_outcome,
      'resolution_source', p_resolution_source,
      'previous_status', v_market_record.status
    ),
    'Market resolution'
  );

  -- Handle invalid or cancel - refund all positions
  IF p_outcome IN ('invalid', 'cancel') THEN
    -- Refund SC positions
    FOR v_position IN
      SELECT p.*, u.sc_balance
      FROM positions p
      JOIN users u ON p.user_id = u.id
      WHERE p.market_id = p_market_id 
        AND p.currency = 'sc' 
        AND p.is_settled = FALSE 
        AND p.is_redeemed = FALSE
      FOR UPDATE OF u
    LOOP
      v_new_balance := v_position.sc_balance + v_position.stake;
      
      UPDATE users SET sc_balance = v_new_balance WHERE id = v_position.user_id;
      
      UPDATE positions SET 
        is_settled = TRUE, 
        payout = v_position.stake, 
        settled_at = NOW() 
      WHERE id = v_position.id;
      
      INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
      VALUES (
        v_position.user_id,
        'PAYOUT',
        v_position.stake,
        v_position.sc_balance,
        v_new_balance,
        'sc',
        'Refund: market ' || p_market_id || ' (' || p_outcome || ')',
        'completed',
        p_market_id,
        v_position.id
      );
      
      v_settled_count := v_settled_count + 1;
    END LOOP;

    -- Refund GC positions
    FOR v_position IN
      SELECT p.*, u.gc_balance
      FROM positions p
      JOIN users u ON p.user_id = u.id
      WHERE p.market_id = p_market_id 
        AND p.currency = 'gc' 
        AND p.is_settled = FALSE 
        AND p.is_redeemed = FALSE
      FOR UPDATE OF u
    LOOP
      v_new_balance := v_position.gc_balance + v_position.stake;
      
      UPDATE users SET gc_balance = v_new_balance WHERE id = v_position.user_id;
      
      UPDATE positions SET 
        is_settled = TRUE, 
        payout = v_position.stake, 
        settled_at = NOW() 
      WHERE id = v_position.id;
      
      INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
      VALUES (
        v_position.user_id,
        'PAYOUT',
        v_position.stake,
        v_position.gc_balance,
        v_new_balance,
        'gc',
        'Refund: market ' || p_market_id || ' (' || p_outcome || ')',
        'completed',
        p_market_id,
        v_position.id
      );
      
      v_settled_count := v_settled_count + 1;
    END LOOP;

    RETURN json_build_object(
      'success', TRUE,
      'outcome', p_outcome,
      'settled_count', v_settled_count,
      'total_payout', v_total_payout,
      'message', 'All positions refunded'
    );
  END IF;

  -- Normal resolution - calculate payouts for winners
  -- Process SC positions
  DECLARE
    v_yes_pool NUMERIC;
    v_no_pool NUMERIC;
    v_total_pool NUMERIC;
    v_payout_pool NUMERIC;
  BEGIN
    v_yes_pool := v_market_record.yes_pool_sc;
    v_no_pool := v_market_record.no_pool_sc;
    v_total_pool := v_yes_pool + v_no_pool;
    
    IF v_total_pool > 0 THEN
      v_payout_pool := v_total_pool * (1 - v_fee_rate);
      v_total_protocol_fee := v_total_pool * v_protocol_fee_rate;
      
      -- Calculate publisher fee if there's a publisher
      IF v_market_record.publisher_id IS NOT NULL THEN
        v_total_publisher_fee := v_total_pool * v_publisher_fee_rate;
      END IF;

      -- Get winner pool
      DECLARE
        v_winner_pool NUMERIC := CASE WHEN p_outcome = 'yes' THEN v_yes_pool ELSE v_no_pool END;
        v_loser_pool NUMERIC := CASE WHEN p_outcome = 'yes' THEN v_no_pool ELSE v_yes_pool END;
      BEGIN
        -- Settle winning positions
        FOR v_position IN
          SELECT p.*, u.sc_balance
          FROM positions p
          JOIN users u ON p.user_id = u.id
          WHERE p.market_id = p_market_id 
            AND p.currency = 'sc' 
            AND p.side = p_outcome
            AND p.is_settled = FALSE 
            AND p.is_redeemed = FALSE
          FOR UPDATE OF u
        LOOP
          -- Calculate proportional payout
          IF v_winner_pool > 0 THEN
            v_payout := (v_position.stake / v_winner_pool) * v_payout_pool;
          ELSE
            v_payout := 0;
          END IF;
          
          v_new_balance := v_position.sc_balance + v_payout;
          
          -- Update user balance and stats
          UPDATE users SET 
            sc_balance = v_new_balance,
            total_won_sc = total_won_sc + v_payout
          WHERE id = v_position.user_id;
          
          -- Mark position as settled
          UPDATE positions SET 
            is_settled = TRUE, 
            payout = v_payout, 
            settled_at = NOW() 
          WHERE id = v_position.id;
          
          -- Log transaction
          INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
          VALUES (
            v_position.user_id,
            'PAYOUT',
            v_payout,
            v_position.sc_balance,
            v_new_balance,
            'sc',
            'Payout: market ' || p_market_id || ' (' || p_outcome || ')',
            'completed',
            p_market_id,
            v_position.id
          );
          
          v_settled_count := v_settled_count + 1;
          v_total_payout := v_total_payout + v_payout;
        END LOOP;

        -- Mark losing positions as settled with 0 payout
        UPDATE positions SET 
          is_settled = TRUE, 
          payout = 0, 
          settled_at = NOW() 
        WHERE market_id = p_market_id 
          AND currency = 'sc' 
          AND side != p_outcome
          AND is_settled = FALSE 
          AND is_redeemed = FALSE;
      END;

      -- Record protocol fee (goes to system)
      IF v_total_protocol_fee > 0 THEN
        INSERT INTO transactions (user_id, type, amount, currency, description, status, market_id)
        VALUES (
          p_admin_id,
          'FEE_PROTOCOL',
          v_total_protocol_fee,
          'sc',
          'Protocol fee: market ' || p_market_id,
          'completed',
          p_market_id
        );
      END IF;

      -- Record publisher fee
      IF v_total_publisher_fee > 0 AND v_market_record.publisher_id IS NOT NULL THEN
        -- Get publisher record
        SELECT * INTO v_referral_record FROM publishers WHERE user_id = v_market_record.publisher_id;
        
        IF FOUND THEN
          -- Create publisher earnings record
          INSERT INTO publisher_earnings (publisher_id, market_id, amount)
          VALUES (v_referral_record.id, p_market_id, v_total_publisher_fee);
          
          -- Update publisher total earned
          UPDATE publishers SET total_earned = total_earned + v_total_publisher_fee WHERE id = v_referral_record.id;
          
          -- Log publisher fee transaction
          INSERT INTO transactions (user_id, type, amount, currency, description, status, market_id)
          VALUES (
            v_market_record.publisher_id,
            'FEE_PUBLISHER',
            v_total_publisher_fee,
            'sc',
            'Publisher fee: market ' || p_market_id,
            'completed',
            p_market_id
          );
        END IF;
      END IF;
    END IF;
  END;

  -- Process GC positions (entertainment only, no real money)
  DECLARE
    v_yes_pool_gc NUMERIC;
    v_no_pool_gc NUMERIC;
    v_total_pool_gc NUMERIC;
    v_payout_pool_gc NUMERIC;
  BEGIN
    v_yes_pool_gc := v_market_record.yes_pool_gc;
    v_no_pool_gc := v_market_record.no_pool_gc;
    v_total_pool_gc := v_yes_pool_gc + v_no_pool_gc;
    
    IF v_total_pool_gc > 0 THEN
      v_payout_pool_gc := v_total_pool_gc * (1 - v_fee_rate);

      DECLARE
        v_winner_pool_gc NUMERIC := CASE WHEN p_outcome = 'yes' THEN v_yes_pool_gc ELSE v_no_pool_gc END;
      BEGIN
        -- Settle winning GC positions
        FOR v_position IN
          SELECT p.*, u.gc_balance
          FROM positions p
          JOIN users u ON p.user_id = u.id
          WHERE p.market_id = p_market_id 
            AND p.currency = 'gc' 
            AND p.side = p_outcome
            AND p.is_settled = FALSE 
            AND p.is_redeemed = FALSE
          FOR UPDATE OF u
        LOOP
          IF v_winner_pool_gc > 0 THEN
            v_payout := (v_position.stake / v_winner_pool_gc) * v_payout_pool_gc;
          ELSE
            v_payout := 0;
          END IF;
          
          v_new_balance := v_position.gc_balance + v_payout;
          
          UPDATE users SET gc_balance = v_new_balance WHERE id = v_position.user_id;
          
          UPDATE positions SET 
            is_settled = TRUE, 
            payout = v_payout, 
            settled_at = NOW() 
          WHERE id = v_position.id;
          
          INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, currency, description, status, market_id, position_id)
          VALUES (
            v_position.user_id,
            'PAYOUT',
            v_payout,
            v_position.gc_balance,
            v_new_balance,
            'gc',
            'Payout: market ' || p_market_id || ' (' || p_outcome || ')',
            'completed',
            p_market_id,
            v_position.id
          );
          
          v_settled_count := v_settled_count + 1;
        END LOOP;

        -- Mark losing GC positions as settled
        UPDATE positions SET 
          is_settled = TRUE, 
          payout = 0, 
          settled_at = NOW() 
        WHERE market_id = p_market_id 
          AND currency = 'gc' 
          AND side != p_outcome
          AND is_settled = FALSE 
          AND is_redeemed = FALSE;
      END;
    END IF;
  END;

  RETURN json_build_object(
    'success', TRUE,
    'outcome', p_outcome,
    'settled_count', v_settled_count,
    'total_payout', v_total_payout,
    'protocol_fee', v_total_protocol_fee,
    'publisher_fee', v_total_publisher_fee,
    'market_id', p_market_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION resolve_market TO authenticated;