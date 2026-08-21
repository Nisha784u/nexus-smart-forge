-- Reconcile profiles for users that existed before the auth/profile fixes.
-- This migration intentionally touches only backend auth/profile data.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name TEXT;
BEGIN
  full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (user_id, name, email, initials, color)
  VALUES (NEW.id, full_name, NEW.email, UPPER(LEFT(full_name, 1)), 'var(--electric)')
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    initials = EXCLUDED.initials;

  RETURN NEW;
END;
$$;

-- Create profiles for auth users missed by the original trigger and make the
-- stored display name agree with the name supplied during signup.
INSERT INTO public.profiles (user_id, name, email, initials, color)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  u.email,
  UPPER(LEFT(COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1)
  ), 1)),
  'var(--electric)'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.profiles p
SET
  name = COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  email = u.email,
  initials = UPPER(LEFT(COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1)
  ), 1))
FROM auth.users u
WHERE p.user_id = u.id;

-- Remove the known development account. Its profile-owned workspace data is
-- removed by the profile delete's existing workspace/member cascades.
DELETE FROM public.profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@nexusflow.test');
DELETE FROM auth.users WHERE email = 'demo@nexusflow.test';

-- Remove any remaining unowned demo profiles left by the old bootstrap.
DELETE FROM public.profiles WHERE user_id IS NULL;