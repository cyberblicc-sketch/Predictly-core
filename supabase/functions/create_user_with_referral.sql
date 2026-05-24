-- ============================================================================
-- create_user_with_referral: Create a new user with optional referral
-- Generates a unique referral code for the new user
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_email TEXT,
  p_name TEXT,
  p_handle TEXT,
  p_password_hash TEXT,
  p_referred_by_code TEXT DEFAULT NULL,
  p_jurisdiction TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Validate email format
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Validate handle
  IF p_handle IS NOT NULL AND LENGTH(p_handle) < 3 THEN
    RAISE EXCEPTION 'Handle must be at least 3 characters';
  END IF;

  -- Generate unique referral code
  v_referral_code := 'REF-' || UPPER(SUBSTRING(p_handle FROM 1 FOR 6) || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));

  -- Check if referred_by_code is valid and get referrer
  IF p_referred_by_code IS NOT NULL AND p_referred_by_code != '' THEN
    SELECT id INTO v_referrer_id FROM users WHERE referral_code = p_referred_by_code;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid referral code';
    END IF;
  END IF;

  -- Create user
  INSERT INTO users (
    email,
    name,
    handle,
    password_hash,
    referral_code,
    referred_by_code,
    jurisdiction,
    auth_provider,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_name,
    p_handle,
    p_password_hash,
    v_referral_code,
    p_referred_by_code,
    p_jurisdiction,
    'email',
    NOW(),
    NOW()
  ) RETURNING id INTO v_user_id;

  -- If there's a referrer, create a pending referral record
  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status)
    VALUES (v_referrer_id, v_user_id, p_referred_by_code, 'pending');
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'referral_code', v_referral_code,
    'referred_by', p_referred_by_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_with_referral TO authenticated;