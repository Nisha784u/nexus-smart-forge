-- =============================================================================
-- Fix: bootstrap_workspace() was seeding every newly registered user's
-- workspace with fake teammates (Priya, Rahul, Ananya, Arjun, Sneha, Rohan),
-- fake projects, tasks, subtasks, comments, notifications, calendar events,
-- and activity entries.
--
-- This migration replaces the function so a new user gets ONLY:
--   - their own real profile (already created by the on_auth_user_created
--     trigger from handle_new_user(), using their real signup name)
--   - a real workspace owned by them
--   - their own workspace_members row as 'owner'
--
-- No demo/fake records of any kind are created.
--
-- Also fixes a second, smaller piece of demo data: both handle_new_user()
-- (the signup trigger) and the old bootstrap_workspace() hardcoded every
-- real user's profile "title" to 'Product Manager' - a leftover from the
-- fictional demo persona, not something the signup form collects or the
-- app requires. The profiles.title column already has its own neutral
-- schema default ('Member'), so both functions are updated to stop
-- overriding it and simply let that existing default apply.
--
-- SAFE FOR PRODUCTION:
--   - Uses CREATE OR REPLACE FUNCTION, so it only changes future behavior.
--   - Does NOT touch existing rows in profiles/workspaces/projects/tasks/etc.
--   - Does NOT drop or alter any table, so all existing legitimate user data
--     (including workspaces created by the old seeded function before this
--     fix) is left exactly as-is.
--   - Function name, argument list, return type, and security/grant model
--     are unchanged, so the existing frontend call
--     `supabase.rpc("bootstrap_workspace")` keeps working without any
--     frontend changes.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.bootstrap_workspace()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me UUID;
  ws UUID;
  me_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Resolve (or, defensively, create) the real profile for this authenticated user.
  -- title is intentionally omitted from the INSERT so it falls back to the
  -- profiles table's own neutral default ('Member') instead of a hardcoded
  -- demo persona like 'Product Manager'.
  SELECT id, name INTO me, me_name FROM public.profiles WHERE user_id = auth.uid();
  IF me IS NULL THEN
    INSERT INTO public.profiles (user_id, name, email, initials)
    SELECT u.id,
           COALESCE(NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)),
           u.email,
           UPPER(LEFT(COALESCE(NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)), 1))
    FROM auth.users u WHERE u.id = auth.uid()
    RETURNING id, name INTO me, me_name;
  END IF;

  -- If this user already belongs to a workspace, just return it (idempotent).
  SELECT wm.workspace_id INTO ws FROM public.workspace_members wm WHERE wm.profile_id = me LIMIT 1;
  IF ws IS NOT NULL THEN
    RETURN ws;
  END IF;

  -- Create the user's own, empty workspace. No demo teammates, projects,
  -- tasks, comments, notifications, calendar events, or activity.
  INSERT INTO public.workspaces (name, owner_profile_id) VALUES (me_name || '''s Workspace', me) RETURNING id INTO ws;
  INSERT INTO public.workspace_members (workspace_id, profile_id, role) VALUES (ws, me, 'owner');

  RETURN ws;
END; $$;

REVOKE ALL ON FUNCTION public.bootstrap_workspace() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_workspace() TO authenticated;

-- =============================================================================
-- Same fix applied to the signup trigger: stop hardcoding 'Product Manager'
-- and let the profiles.title column default ('Member') apply instead.
-- Everything else about this function (name resolution, initials, color,
-- ON CONFLICT DO NOTHING, security/grant model) is unchanged.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  full_name TEXT;
BEGIN
  full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''), split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (user_id, name, email, initials, color)
  VALUES (
    NEW.id,
    full_name,
    NEW.email,
    UPPER(LEFT(full_name, 1)),
    'var(--electric)'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
