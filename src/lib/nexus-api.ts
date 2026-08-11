import { supabase } from "@/integrations/supabase/client";
import {
  formatDueLabel,
  formatRelativeTime,
  type ActivityItem,
  type CalendarEvent,
  type Member,
  type Notification,
  type Priority,
  type Project,
  type Status,
  type Task,
  type TaskComment,
  type WorkspaceRole,
} from "./nexus-data";

export type WorkspaceSnapshot = {
  workspaceId: string;
  workspaceName: string;
  currentProfileId: string | null;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  comments: TaskComment[];
  notifications: Notification[];
  events: CalendarEvent[];
  activity: ActivityItem[];
};

function initialsOf(name: string) {
  return (name.trim()[0] ?? "?").toUpperCase();
}

/** Resolves (and on first sign-in, seeds) the workspace for the current user. */
export async function bootstrapWorkspace(): Promise<string> {
  const { data, error } = await supabase.rpc("bootstrap_workspace");
  if (error) throw error;
  if (!data) throw new Error("No workspace available for this account.");
  return data as string;
}

export async function loadWorkspace(workspaceId: string): Promise<WorkspaceSnapshot> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;

  const [ws, wm, pm, projectRows, taskRows, subtaskRows, commentRows, notificationRows, eventRows, activityRows] =
    await Promise.all([
      supabase.from("workspaces").select("id, name").eq("id", workspaceId).maybeSingle(),
      supabase.from("workspace_members").select("profile_id, role, profiles(*)").eq("workspace_id", workspaceId),
      supabase.from("project_members").select("project_id, profile_id").eq("workspace_id", workspaceId),
      supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at"),
      supabase.from("tasks").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("subtasks").select("*").eq("workspace_id", workspaceId).order("position"),
      supabase.from("comments").select("*").eq("workspace_id", workspaceId).order("created_at"),
      supabase
        .from("notifications")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase.from("calendar_events").select("*").eq("workspace_id", workspaceId).order("event_date"),
      supabase
        .from("activity")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

  const firstError =
    ws.error ??
    wm.error ??
    pm.error ??
    projectRows.error ??
    taskRows.error ??
    subtaskRows.error ??
    commentRows.error ??
    notificationRows.error ??
    eventRows.error ??
    activityRows.error;
  if (firstError) throw firstError;

  const tasks: Task[] = (taskRows.data ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    projectId: t.project_id ?? "",
    status: t.status as Status,
    priority: t.priority as Priority,
    assigneeId: t.assignee_id ?? "",
    due: formatDueLabel(t.due_date),
    dueDate: t.due_date,
    comments: (commentRows.data ?? []).filter((c) => c.task_id === t.id).length,
    attachments: t.attachments,
    subtasks: (subtaskRows.data ?? [])
      .filter((s) => s.task_id === t.id)
      .map((s) => ({ id: s.id, title: s.title, done: s.done })),
    tags: t.tags ?? [],
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  const currentProfile = (wm.data ?? []).find((m) => m.profiles && m.profiles.user_id === userId);

  const members: Member[] = (wm.data ?? [])
    .filter((m) => m.profiles)
    .map((m) => {
      const p = m.profiles!;
      const mine = tasks.filter((t) => t.assigneeId === p.id);
      const done = mine.filter((t) => t.status === "done").length;
      const active = mine.length - done;
      return {
        id: p.id,
        name: p.name,
        role: p.title,
        initials: p.initials || initialsOf(p.name),
        color: p.color,
        email: p.email ?? "",
        activeTasks: active,
        completedTasks: done,
        workload: Math.min(100, active * 12),
        presence: p.presence as Member["presence"],
        workspaceRole: m.role as WorkspaceRole,
        isCurrentUser: p.user_id === userId,
      };
    })
    .sort((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser) || a.name.localeCompare(b.name));

  const projects: Project[] = (projectRows.data ?? []).map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const done = pTasks.filter((t) => t.status === "done").length;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      progress: p.progress,
      status: p.status as Project["status"],
      tasksDone: done,
      tasksTotal: pTasks.length,
      due: formatDueLabel(p.due_date),
      dueDate: p.due_date,
      memberIds: (pm.data ?? []).filter((r) => r.project_id === p.id).map((r) => r.profile_id),
      aiActive: p.ai_active,
      health: p.health,
    };
  });

  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.name ?? "Someone";

  return {
    workspaceId,
    workspaceName: ws.data?.name ?? "Workspace",
    currentProfileId: currentProfile?.profile_id ?? null,
    members,
    projects,
    tasks,
    comments: (commentRows.data ?? []).map((c) => ({
      id: c.id,
      taskId: c.task_id,
      authorId: c.author_id,
      body: c.body,
      time: formatRelativeTime(c.created_at),
      createdAt: c.created_at,
    })),
    notifications: (notificationRows.data ?? [])
      .filter((n) => n.profile_id === currentProfile?.profile_id)
      .map((n) => ({
        id: n.id,
        type: n.type as Notification["type"],
        title: n.title,
        body: n.body,
        time: formatRelativeTime(n.created_at),
        unread: n.unread,
        mention: n.mention,
      })),
    events: (eventRows.data ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      day: Number(e.event_date.slice(8, 10)),
      date: e.event_date,
      kind: e.kind as CalendarEvent["kind"],
      time: e.time_label,
      projectId: e.project_id,
    })),
    activity: (activityRows.data ?? []).map((a) => ({
      id: a.id,
      who: nameOf(a.actor_id),
      what: a.action,
      target: a.target,
      time: formatRelativeTime(a.created_at),
    })),
  };
}

type Ids = { workspaceId: string; profileId: string | null };

export async function logActivity(
  ids: Ids,
  action: string,
  target: string,
  extra: { projectId?: string | null; taskId?: string | null } = {},
) {
  await supabase.from("activity").insert({
    workspace_id: ids.workspaceId,
    actor_id: ids.profileId,
    action,
    target,
    project_id: extra.projectId ?? null,
    task_id: extra.taskId ?? null,
  });
}

export async function notifySelf(
  ids: Ids,
  payload: { type: Notification["type"]; title: string; body: string; mention?: boolean },
) {
  if (!ids.profileId) return;
  await supabase.from("notifications").insert({
    workspace_id: ids.workspaceId,
    profile_id: ids.profileId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    mention: payload.mention ?? false,
  });
}
