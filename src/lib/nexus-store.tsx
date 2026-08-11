import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapWorkspace,
  loadWorkspace,
  logActivity,
  notifySelf,
  type WorkspaceSnapshot,
} from "./nexus-api";
import {
  formatDueLabel,
  setMemberRegistry,
  setProjectRegistry,
  toIsoDate,
  type ActivityItem,
  type CalendarEvent,
  type Member,
  type Notification,
  type Priority,
  type Project,
  type Status,
  type Task,
  type TaskComment,
} from "./nexus-data";

export type TaskTrendPoint = { week: string; created: number; completed: number; velocity: number };

type Ctx = {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  workspaceId: string | null;
  workspaceName: string;
  currentProfileId: string | null;
  currentMember: Member | null;

  members: Member[];
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  activity: ActivityItem[];
  notifications: Notification[];
  taskTrend: TaskTrendPoint[];

  commentsFor: (taskId: string) => TaskComment[];
  addComment: (taskId: string, body: string) => Promise<void>;

  setTaskStatus: (id: string, status: Status) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  addTask: (task: {
    title: string;
    description?: string;
    projectId?: string | null;
    status?: Status;
    priority?: Priority;
    assigneeId?: string | null;
    dueDate?: string | null;
    tags?: string[];
  }) => Promise<void>;
  updateTask: (
    id: string,
    patch: {
      title?: string;
      description?: string;
      status?: Status;
      priority?: Priority;
      assigneeId?: string | null;
      dueDate?: string | null;
      projectId?: string | null;
    },
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addProject: (input: { name: string; description?: string; dueDate?: string | null }) => Promise<void>;
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "description" | "status" | "progress">>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleProjectMember: (projectId: string, profileId: string) => Promise<void>;

  addEvent: (input: { title: string; date: string; kind?: CalendarEvent["kind"]; time?: string }) => Promise<void>;
  moveEvent: (id: string, date: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  markAllRead: () => Promise<void>;
  toggleRead: (id: string) => Promise<void>;

  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
};

const NexusContext = createContext<Ctx | null>(null);

const emptySnapshot: WorkspaceSnapshot = {
  workspaceId: "",
  workspaceName: "Workspace",
  currentProfileId: null,
  members: [],
  projects: [],
  tasks: [],
  comments: [],
  notifications: [],
  events: [],
  activity: [],
};

function buildTaskTrend(tasks: Task[]): TaskTrendPoint[] {
  const weeks: TaskTrendPoint[] = [];
  const now = Date.now();
  for (let i = 5; i >= 0; i--) {
    const end = now - i * 7 * 86400000;
    const start = end - 7 * 86400000;
    const created = tasks.filter((t) => {
      const ts = t.createdAt ? new Date(t.createdAt).getTime() : NaN;
      return ts >= start && ts < end;
    }).length;
    const completed = tasks.filter((t) => {
      if (t.status !== "done") return false;
      const ts = t.updatedAt ? new Date(t.updatedAt).getTime() : NaN;
      return ts >= start && ts < end;
    }).length;
    weeks.push({ week: `W${6 - i}`, created, completed, velocity: created + completed });
  }
  return weeks;
}

export function NexusProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const workspaceRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const wsId = workspaceRef.current ?? (await bootstrapWorkspace());
      workspaceRef.current = wsId;
      const next = await loadWorkspace(wsId);
      setSnapshot(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep the id → entity registries used by presentational components in sync.
  useEffect(() => {
    setMemberRegistry(snapshot.members);
    setProjectRegistry(snapshot.projects);
  }, [snapshot.members, snapshot.projects]);

  const ids = useMemo(
    () => ({ workspaceId: snapshot.workspaceId, profileId: snapshot.currentProfileId }),
    [snapshot.workspaceId, snapshot.currentProfileId],
  );

  const guard = useCallback(
    async (fn: () => Promise<void>) => {
      if (!snapshot.workspaceId) return;
      try {
        await fn();
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "That change could not be saved.");
      }
    },
    [snapshot.workspaceId, refresh],
  );

  const taskById = useCallback((id: string) => snapshot.tasks.find((t) => t.id === id), [snapshot.tasks]);

  const setTaskStatus = useCallback(
    (id: string, status: Status) =>
      guard(async () => {
        const { error: e } = await supabase.from("tasks").update({ status }).eq("id", id);
        if (e) throw e;
        const task = taskById(id);
        await logActivity(ids, `changed status to ${status}`, task?.title ?? "a task", { taskId: id });
        if (status === "done" && task) {
          await notifySelf(ids, { type: "completed", title: "Task completed", body: `“${task.title}” was marked done.` });
        }
      }),
    [guard, ids, taskById],
  );

  const toggleTaskDone = useCallback(
    (id: string) => {
      const task = taskById(id);
      return setTaskStatus(id, task?.status === "done" ? "in-progress" : "done");
    },
    [setTaskStatus, taskById],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) =>
      guard(async () => {
        const current = taskById(taskId)?.subtasks.find((s) => s.id === subtaskId);
        const { error: e } = await supabase.from("subtasks").update({ done: !current?.done }).eq("id", subtaskId);
        if (e) throw e;
      }),
    [guard, taskById],
  );

  const addSubtask = useCallback(
    (taskId: string, title: string) =>
      guard(async () => {
        const position = taskById(taskId)?.subtasks.length ?? 0;
        const { error: e } = await supabase
          .from("subtasks")
          .insert({ task_id: taskId, workspace_id: snapshot.workspaceId, title, position });
        if (e) throw e;
      }),
    [guard, snapshot.workspaceId, taskById],
  );

  const addTask = useCallback<Ctx["addTask"]>(
    (task) =>
      guard(async () => {
        const { error: e } = await supabase.from("tasks").insert({
          workspace_id: snapshot.workspaceId,
          project_id: task.projectId ?? snapshot.projects[0]?.id ?? null,
          title: task.title,
          description: task.description ?? "",
          status: task.status ?? "todo",
          priority: task.priority ?? "medium",
          assignee_id: task.assigneeId ?? snapshot.currentProfileId,
          due_date: task.dueDate ?? null,
          tags: task.tags ?? [],
          created_by: snapshot.currentProfileId,
        });
        if (e) throw e;
        await logActivity(ids, "created", task.title);
        await notifySelf(ids, { type: "assigned", title: "New task created", body: `“${task.title}” was added to your workspace.` });
      }),
    [guard, ids, snapshot.workspaceId, snapshot.projects, snapshot.currentProfileId],
  );

  const updateTask = useCallback<Ctx["updateTask"]>(
    (id, patch) =>
      guard(async () => {
        const { error: e } = await supabase
          .from("tasks")
          .update({
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.description !== undefined ? { description: patch.description } : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
            ...(patch.assigneeId !== undefined ? { assignee_id: patch.assigneeId } : {}),
            ...(patch.dueDate !== undefined ? { due_date: patch.dueDate } : {}),
            ...(patch.projectId !== undefined ? { project_id: patch.projectId } : {}),
          })
          .eq("id", id);
        if (e) throw e;
        await logActivity(ids, "updated", taskById(id)?.title ?? "a task", { taskId: id });
      }),
    [guard, ids, taskById],
  );

  const deleteTask = useCallback(
    (id: string) =>
      guard(async () => {
        const title = taskById(id)?.title ?? "a task";
        await supabase.from("comments").delete().eq("task_id", id);
        await supabase.from("subtasks").delete().eq("task_id", id);
        await supabase.from("activity").update({ task_id: null }).eq("task_id", id);
        const { error: e } = await supabase.from("tasks").delete().eq("id", id);
        if (e) throw e;
        await logActivity(ids, "deleted", title);
      }),
    [guard, ids, taskById],
  );

  const addComment = useCallback(
    (taskId: string, body: string) =>
      guard(async () => {
        if (!snapshot.currentProfileId) throw new Error("You need a profile to comment.");
        const { error: e } = await supabase.from("comments").insert({
          task_id: taskId,
          workspace_id: snapshot.workspaceId,
          author_id: snapshot.currentProfileId,
          body,
        });
        if (e) throw e;
        await logActivity(ids, "added a comment on", taskById(taskId)?.title ?? "a task", { taskId });
      }),
    [guard, ids, snapshot.currentProfileId, snapshot.workspaceId, taskById],
  );

  const addProject = useCallback<Ctx["addProject"]>(
    (input) =>
      guard(async () => {
        const { data, error: e } = await supabase
          .from("projects")
          .insert({
            workspace_id: snapshot.workspaceId,
            name: input.name,
            description: input.description ?? "",
            due_date: input.dueDate ?? null,
            created_by: snapshot.currentProfileId,
          })
          .select("id")
          .single();
        if (e) throw e;
        if (data && snapshot.currentProfileId) {
          await supabase
            .from("project_members")
            .insert({ project_id: data.id, profile_id: snapshot.currentProfileId, workspace_id: snapshot.workspaceId });
        }
        await logActivity(ids, "created the project", input.name, { projectId: data?.id ?? null });
      }),
    [guard, ids, snapshot.workspaceId, snapshot.currentProfileId],
  );

  const updateProject = useCallback<Ctx["updateProject"]>(
    (id, patch) =>
      guard(async () => {
        const { error: e } = await supabase.from("projects").update(patch).eq("id", id);
        if (e) throw e;
      }),
    [guard],
  );

  const deleteProject = useCallback(
    (id: string) =>
      guard(async () => {
        const { error: e } = await supabase.from("projects").delete().eq("id", id);
        if (e) throw e;
      }),
    [guard],
  );

  const toggleProjectMember = useCallback(
    (projectId: string, profileId: string) =>
      guard(async () => {
        const project = snapshot.projects.find((p) => p.id === projectId);
        if (project?.memberIds.includes(profileId)) {
          const { error: e } = await supabase
            .from("project_members")
            .delete()
            .eq("project_id", projectId)
            .eq("profile_id", profileId);
          if (e) throw e;
        } else {
          const { error: e } = await supabase
            .from("project_members")
            .insert({ project_id: projectId, profile_id: profileId, workspace_id: snapshot.workspaceId });
          if (e) throw e;
        }
      }),
    [guard, snapshot.projects, snapshot.workspaceId],
  );

  const addEvent = useCallback<Ctx["addEvent"]>(
    (input) =>
      guard(async () => {
        const { error: e } = await supabase.from("calendar_events").insert({
          workspace_id: snapshot.workspaceId,
          title: input.title,
          event_date: input.date,
          kind: input.kind ?? "event",
          time_label: input.time ?? "All day",
          created_by: snapshot.currentProfileId,
        });
        if (e) throw e;
      }),
    [guard, snapshot.workspaceId, snapshot.currentProfileId],
  );

  const moveEvent = useCallback(
    (id: string, date: string) =>
      guard(async () => {
        const { error: e } = await supabase.from("calendar_events").update({ event_date: date }).eq("id", id);
        if (e) throw e;
      }),
    [guard],
  );

  const deleteEvent = useCallback(
    (id: string) =>
      guard(async () => {
        const { error: e } = await supabase.from("calendar_events").delete().eq("id", id);
        if (e) throw e;
      }),
    [guard],
  );

  const markAllRead = useCallback(
    () =>
      guard(async () => {
        if (!snapshot.currentProfileId) return;
        const { error: e } = await supabase
          .from("notifications")
          .update({ unread: false })
          .eq("profile_id", snapshot.currentProfileId)
          .eq("unread", true);
        if (e) throw e;
      }),
    [guard, snapshot.currentProfileId],
  );

  const toggleRead = useCallback(
    (id: string) =>
      guard(async () => {
        const current = snapshot.notifications.find((n) => n.id === id);
        const { error: e } = await supabase.from("notifications").update({ unread: !current?.unread }).eq("id", id);
        if (e) throw e;
      }),
    [guard, snapshot.notifications],
  );

  const commentsFor = useCallback(
    (taskId: string) => snapshot.comments.filter((c) => c.taskId === taskId),
    [snapshot.comments],
  );

  const currentMember = useMemo(
    () => snapshot.members.find((m) => m.isCurrentUser) ?? null,
    [snapshot.members],
  );

  const taskTrend = useMemo(() => buildTaskTrend(snapshot.tasks), [snapshot.tasks]);

  const value = useMemo<Ctx>(
    () => ({
      loading,
      error,
      refresh,
      workspaceId: snapshot.workspaceId || null,
      workspaceName: snapshot.workspaceName,
      currentProfileId: snapshot.currentProfileId,
      currentMember,
      members: snapshot.members,
      projects: snapshot.projects,
      tasks: snapshot.tasks,
      events: snapshot.events,
      activity: snapshot.activity,
      notifications: snapshot.notifications,
      taskTrend,
      commentsFor,
      addComment,
      setTaskStatus,
      toggleTaskDone,
      toggleSubtask,
      addSubtask,
      addTask,
      updateTask,
      deleteTask,
      addProject,
      updateProject,
      deleteProject,
      toggleProjectMember,
      addEvent,
      moveEvent,
      deleteEvent,
      markAllRead,
      toggleRead,
      paletteOpen,
      setPaletteOpen,
    }),
    [
      loading,
      error,
      refresh,
      snapshot,
      currentMember,
      taskTrend,
      commentsFor,
      addComment,
      setTaskStatus,
      toggleTaskDone,
      toggleSubtask,
      addSubtask,
      addTask,
      updateTask,
      deleteTask,
      addProject,
      updateProject,
      deleteProject,
      toggleProjectMember,
      addEvent,
      moveEvent,
      deleteEvent,
      markAllRead,
      toggleRead,
      paletteOpen,
    ],
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside NexusProvider");
  return ctx;
}

export { formatDueLabel, toIsoDate };
