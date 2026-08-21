-- Fix profile name sourcing from auth metadata and bootstrap_workspace fallback.
-- Safe: no destructive data operations; only updates auto-generated email-prefix names.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name TEXT;
BEGIN
  full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''), split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (user_id, name, email, title, initials, color)
  VALUES (
    NEW.id,
    full_name,
    NEW.email,
    'Product Manager',
    UPPER(LEFT(full_name, 1)),
    'var(--electric)'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

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
  priya UUID; rahul UUID; ananya UUID; arjun UUID; sneha UUID; rohan UUID;
  p1 UUID; p2 UUID; p3 UUID; p4 UUID;
  t1 UUID; t4 UUID; t5 UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, name INTO me, me_name FROM public.profiles WHERE user_id = auth.uid();
  IF me IS NULL THEN
    INSERT INTO public.profiles (user_id, name, email, title, initials)
    SELECT
      u.id,
      COALESCE(NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)),
      u.email,
      'Product Manager',
      UPPER(LEFT(COALESCE(NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)), 1))
    FROM auth.users u
    WHERE u.id = auth.uid()
    RETURNING id, name INTO me, me_name;
  END IF;

  SELECT wm.workspace_id INTO ws FROM public.workspace_members wm WHERE wm.profile_id = me LIMIT 1;
  IF ws IS NOT NULL THEN
    RETURN ws;
  END IF;

  INSERT INTO public.workspaces (name, owner_profile_id) VALUES (me_name || '''s Workspace', me) RETURNING id INTO ws;
  INSERT INTO public.workspace_members (workspace_id, profile_id, role) VALUES (ws, me, 'owner');

  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Priya','UI/UX Designer','P','var(--violet)','online') RETURNING id INTO priya;
  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Rahul','Backend Engineer','R','var(--warning)','offline') RETURNING id INTO rahul;
  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Ananya','Frontend Engineer','A','var(--cyan)','away') RETURNING id INTO ananya;
  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Arjun','AI Engineer','A','var(--violet)','online') RETURNING id INTO arjun;
  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Sneha','QA Engineer','S','var(--success)','online') RETURNING id INTO sneha;
  INSERT INTO public.profiles (name, title, initials, color, presence) VALUES ('Rohan','Project Coordinator','R','var(--cyan)','away') RETURNING id INTO rohan;

  INSERT INTO public.workspace_members (workspace_id, profile_id, role) VALUES
    (ws, priya, 'admin'), (ws, rahul, 'member'), (ws, ananya, 'member'),
    (ws, arjun, 'member'), (ws, sneha, 'member'), (ws, rohan, 'member');

  INSERT INTO public.projects (workspace_id, name, description, status, progress, health, due_date, created_by)
    VALUES (ws,'Mobile App','Cross-platform companion app with offline sync and push workflows.','on-track',72,84,current_date + 21, me) RETURNING id INTO p1;
  INSERT INTO public.projects (workspace_id, name, description, status, progress, health, due_date, created_by)
    VALUES (ws,'Website Redesign','Marketing site rebuild with a new design system and CMS pipeline.','at-risk',48,61,current_date + 9, me) RETURNING id INTO p2;
  INSERT INTO public.projects (workspace_id, name, description, status, progress, health, due_date, ai_active, created_by)
    VALUES (ws,'Nexus AI Dashboard','Realtime AI analytics surface for workspace-wide project intelligence.','on-track',90,90,current_date + 6, true, me) RETURNING id INTO p3;
  INSERT INTO public.projects (workspace_id, name, description, status, progress, health, due_date, created_by)
    VALUES (ws,'Marketing Website','Campaign landing pages, lifecycle emails and attribution tracking.','planning',25,72,current_date + 46, me) RETURNING id INTO p4;

  INSERT INTO public.project_members (project_id, profile_id, workspace_id) VALUES
    (p1, me, ws), (p1, ananya, ws), (p1, sneha, ws), (p1, rohan, ws),
    (p2, priya, ws), (p2, ananya, ws), (p2, rohan, ws),
    (p3, me, ws), (p3, priya, ws), (p3, sneha, ws), (p3, rahul, ws), (p3, arjun, ws),
    (p4, priya, ws), (p4, rahul, ws), (p4, arjun, ws);

  INSERT INTO public.tasks (workspace_id, project_id, title, description, status, priority, assignee_id, due_date, tags, attachments, created_by) VALUES
    (ws,p3,'API Integration','Integrate the analytics API and handle retries, webhooks and reconciliation.','in-progress','high',me,current_date + 3,ARRAY['engineering'],3,me) RETURNING id INTO t1;
  INSERT INTO public.tasks (workspace_id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_by) VALUES
    (ws,p3,'User Authentication','Add sign-in, sessions and password recovery.','backlog','medium',rahul,current_date + 7,ARRAY['engineering'],me),
    (ws,p2,'Order Summary redesign','Rework the order summary layout and states.','todo','high',priya,current_date + 1,ARRAY['design'],me);
  INSERT INTO public.tasks (workspace_id, project_id, title, description, status, priority, assignee_id, due_date, tags, attachments, created_by) VALUES
    (ws,p1,'Payment Gateway','Integrate the payment gateway and handle all transaction workflows.','in-progress','urgent',rahul,current_date,ARRAY['engineering'],4,me) RETURNING id INTO t4;
  INSERT INTO public.tasks (workspace_id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_by) VALUES
    (ws,p2,'Design System tokens','Define colour, spacing and typography tokens.','review','medium',priya,current_date + 5,ARRAY['design'],me) RETURNING id INTO t5;
  INSERT INTO public.tasks (workspace_id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_by) VALUES
    (ws,p1,'Offline sync engine','Queue and reconcile offline mutations.','in-progress','high',ananya,current_date + 4,ARRAY['engineering'],me),
    (ws,p1,'Onboarding flow','First-run experience for new accounts.','todo','low',priya,current_date + 12,ARRAY['design'],me),
    (ws,p3,'Analytics events','Instrument product analytics events.','done','medium',sneha,current_date - 9,ARRAY['engineering'],me),
    (ws,p1,'Push notifications','Delivery, deep links and preferences.','backlog','medium',ananya,current_date + 18,ARRAY['engineering'],me),
    (ws,p4,'Landing page hero','Hero section and campaign messaging.','todo','medium',priya,current_date + 25,ARRAY['marketing'],me),
    (ws,p3,'Regression test suite','Automated regression coverage before release.','review','high',sneha,current_date + 6,ARRAY['qa'],me),
    (ws,p3,'Deploy pipeline','CI/CD pipeline and environment promotion.','done','low',rahul,current_date - 12,ARRAY['engineering'],me),
    (ws,p4,'Content migration','Move legacy content into the new CMS.','backlog','low',rohan,current_date + 40,ARRAY['content'],me),
    (ws,p2,'Accessibility audit','WCAG audit and remediation plan.','in-progress','medium',sneha,current_date + 8,ARRAY['qa'],me),
    (ws,p1,'Billing edge cases','Proration, refunds and failed payments.','review','urgent',rahul,current_date + 2,ARRAY['engineering'],me),
    (ws,p3,'Release notes','Draft and publish the release notes.','done','low',rohan,current_date - 16,ARRAY['content'],me);

  INSERT INTO public.subtasks (task_id, workspace_id, title, done, position) VALUES
    (t1, ws, 'Set up API endpoint', true, 0),
    (t1, ws, 'Implement authentication', true, 1),
    (t1, ws, 'Handle API responses', false, 2),
    (t1, ws, 'Error handling', false, 3),
    (t4, ws, 'Provider sandbox setup', true, 0),
    (t4, ws, 'Webhook reconciliation', false, 1),
    (t5, ws, 'Colour scale', true, 0),
    (t5, ws, 'Spacing scale', false, 1);

  INSERT INTO public.comments (task_id, workspace_id, author_id, body) VALUES
    (t1, ws, arjun, 'Can we ship the retry logic first? It unblocks the dashboard.'),
    (t1, ws, priya, 'Design for the error states is ready in Figma.'),
    (t4, ws, rahul, 'Sandbox credentials are in the shared vault.');

  INSERT INTO public.notifications (workspace_id, profile_id, type, title, body, unread, mention) VALUES
    (ws, me, 'assigned', 'New task assigned', 'Priya assigned you "Design System tokens" in Website Redesign.', true, true),
    (ws, me, 'ai', 'Nexus AI recommendation', 'Testing is the bottleneck on Nexus AI Dashboard. Consider rebalancing two tasks.', true, false),
    (ws, me, 'comment', 'New comment', 'Arjun mentioned you on "API Integration".', true, true),
    (ws, me, 'deadline', 'Deadline approaching', '"Payment Gateway" is due in 2 days.', false, false),
    (ws, me, 'completed', 'Task completed', 'Sneha completed "Analytics events".', false, false),
    (ws, me, 'project', 'Project update', 'Nexus AI Dashboard reached 90% completion.', false, false);

  INSERT INTO public.calendar_events (workspace_id, project_id, title, kind, event_date, time_label, created_by) VALUES
    (ws, p3, 'Sprint planning', 'meeting', date_trunc('month', current_date)::date + 3, '09:30', me),
    (ws, p3, 'API Integration due', 'deadline', date_trunc('month', current_date)::date + 10, '17:00', me),
    (ws, p2, 'Design review', 'meeting', date_trunc('month', current_date)::date + 10, '14:00', me),
    (ws, p1, 'Beta milestone', 'milestone', date_trunc('month', current_date)::date + 14, 'All day', me),
    (ws, p1, 'Payment Gateway due', 'deadline', date_trunc('month', current_date)::date + 17, '18:00', me),
    (ws, NULL, 'Team offsite', 'event', date_trunc('month', current_date)::date + 21, '10:00', me),
    (ws, p3, 'Launch readiness', 'milestone', date_trunc('month', current_date)::date + 25, '11:00', me),
    (ws, NULL, 'Retro', 'meeting', date_trunc('month', current_date)::date + 28, '16:00', me);

  INSERT INTO public.activity (workspace_id, actor_id, action, target, project_id, task_id, created_at) VALUES
    (ws, me, 'changed status to In Progress', 'API Integration', p3, t1, now() - interval '10 minutes'),
    (ws, priya, 'added a comment on', 'Design System tokens', p2, t5, now() - interval '42 minutes'),
    (ws, ananya, 'attached a file to', 'Offline sync engine', p1, NULL, now() - interval '2 hours'),
    (ws, sneha, 'completed', 'Analytics events', p3, NULL, now() - interval '5 hours'),
    (ws, rahul, 'opened a review on', 'Billing edge cases', p1, NULL, now() - interval '8 hours'),
    (ws, arjun, 'generated AI insights for', 'Nexus AI Dashboard', p3, NULL, now() - interval '6 hours'),
    (ws, rohan, 'updated the timeline for', 'Website Redesign', p2, NULL, now() - interval '9 hours');

  RETURN ws;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_workspace() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_workspace() TO authenticated;

-- Backfill only profiles whose name still matches the email local-part (auto-generated).
UPDATE public.profiles p
SET
  name = TRIM(u.raw_user_meta_data ->> 'name'),
  initials = UPPER(LEFT(TRIM(u.raw_user_meta_data ->> 'name'), 1))
FROM auth.users u
WHERE p.user_id = u.id
  AND NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), '') IS NOT NULL
  AND p.name = split_part(u.email, '@', 1);
