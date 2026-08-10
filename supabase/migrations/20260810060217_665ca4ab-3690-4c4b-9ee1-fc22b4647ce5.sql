-- ENUMS
CREATE TYPE public.workspace_role AS ENUM ('owner','admin','member');
CREATE TYPE public.task_status AS ENUM ('backlog','todo','in-progress','review','done');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.project_status AS ENUM ('on-track','at-risk','planning','completed');
CREATE TYPE public.presence_state AS ENUM ('online','away','offline');
CREATE TYPE public.notification_type AS ENUM ('assigned','completed','comment','deadline','ai','project');
CREATE TYPE public.event_kind AS ENUM ('deadline','meeting','milestone','event');

-- TIMESTAMP HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES (user_id NULL = demo teammate seeded in a workspace)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  title TEXT NOT NULL DEFAULT 'Member',
  initials TEXT NOT NULL DEFAULT '?',
  color TEXT NOT NULL DEFAULT 'var(--electric)',
  presence public.presence_state NOT NULL DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX profiles_user_id_idx ON public.profiles(user_id);

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, profile_id)
);
CREATE INDEX workspace_members_profile_idx ON public.workspace_members(profile_id);

-- SECURITY HELPERS
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    JOIN public.profiles p ON p.id = wm.profile_id
    WHERE wm.workspace_id = _workspace_id AND p.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(_workspace_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    JOIN public.profiles p ON p.id = wm.profile_id
    WHERE wm.workspace_id = _workspace_id AND p.user_id = auth.uid()
      AND wm.role IN ('owner','admin')
  );
$$;

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status public.project_status NOT NULL DEFAULT 'planning',
  health SMALLINT NOT NULL DEFAULT 80 CHECK (health BETWEEN 0 AND 100),
  progress SMALLINT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  due_date DATE,
  ai_active BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX projects_workspace_idx ON public.projects(workspace_id);

CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);
CREATE INDEX project_members_project_idx ON public.project_members(project_id);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  attachments SMALLINT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_workspace_idx ON public.tasks(workspace_id);
CREATE INDEX tasks_project_idx ON public.tasks(project_id);
CREATE INDEX tasks_assignee_idx ON public.tasks(assignee_id);

CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX subtasks_task_idx ON public.subtasks(task_id);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX comments_task_idx ON public.comments(task_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'project',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  unread BOOLEAN NOT NULL DEFAULT true,
  mention BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_profile_idx ON public.notifications(profile_id, unread);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind public.event_kind NOT NULL DEFAULT 'event',
  event_date DATE NOT NULL,
  time_label TEXT NOT NULL DEFAULT 'All day',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX calendar_events_workspace_date_idx ON public.calendar_events(workspace_id, event_date);

CREATE TABLE public.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activity_workspace_idx ON public.activity(workspace_id, created_at DESC);

-- UPDATED_AT TRIGGERS
CREATE TRIGGER t_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_workspaces_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_subtasks_updated BEFORE UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_comments_updated BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_calendar_events_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity TO authenticated;
GRANT ALL ON public.profiles, public.workspaces, public.workspace_members, public.projects, public.project_members, public.tasks, public.subtasks, public.comments, public.notifications, public.calendar_events, public.activity TO service_role;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

-- profiles: own profile + profiles that share a workspace
CREATE POLICY "profiles_select_self_or_shared" ON public.profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.profile_id = profiles.id AND public.is_workspace_member(wm.workspace_id)
  )
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT TO authenticated
USING (public.is_workspace_member(id));
CREATE POLICY "workspaces_update_admin" ON public.workspaces FOR UPDATE TO authenticated
USING (public.is_workspace_admin(id)) WITH CHECK (public.is_workspace_admin(id));

CREATE POLICY "workspace_members_select" ON public.workspace_members FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_admin_write" ON public.workspace_members FOR INSERT TO authenticated
WITH CHECK (public.is_workspace_admin(workspace_id));
CREATE POLICY "workspace_members_admin_update" ON public.workspace_members FOR UPDATE TO authenticated
USING (public.is_workspace_admin(workspace_id)) WITH CHECK (public.is_workspace_admin(workspace_id));
CREATE POLICY "workspace_members_admin_delete" ON public.workspace_members FOR DELETE TO authenticated
USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "project_members_select" ON public.project_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "project_members_insert" ON public.project_members FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "project_members_delete" ON public.project_members FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));

CREATE POLICY "subtasks_select" ON public.subtasks FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "subtasks_insert" ON public.subtasks FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "subtasks_update" ON public.subtasks FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "subtasks_delete" ON public.subtasks FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));

CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id) AND author_id = public.current_profile_id());
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE TO authenticated USING (author_id = public.current_profile_id()) WITH CHECK (author_id = public.current_profile_id());
CREATE POLICY "comments_delete_own_or_admin" ON public.comments FOR DELETE TO authenticated USING (author_id = public.current_profile_id() OR public.is_workspace_admin(workspace_id));

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (profile_id = public.current_profile_id());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (profile_id = public.current_profile_id());

CREATE POLICY "calendar_events_select" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "calendar_events_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "calendar_events_update" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id)) WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "calendar_events_delete" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id));

CREATE POLICY "activity_select" ON public.activity FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "activity_insert" ON public.activity FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));

-- PROFILE AUTO-CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();