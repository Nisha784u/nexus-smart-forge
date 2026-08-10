export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";
export type WorkspaceRole = "owner" | "admin" | "member";

export type Member = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  email: string;
  activeTasks: number;
  completedTasks: number;
  workload: number;
  presence: "online" | "away" | "offline";
  workspaceRole?: WorkspaceRole;
  isCurrentUser?: boolean;
};

export type Subtask = { id: string; title: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  /** Display label, e.g. "May 24" */
  due: string;
  /** ISO date (yyyy-mm-dd) or null */
  dueDate?: string | null;
  comments: number;
  attachments: number;
  subtasks: Subtask[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "on-track" | "at-risk" | "planning" | "completed";
  tasksDone: number;
  tasksTotal: number;
  due: string;
  dueDate?: string | null;
  memberIds: string[];
  aiActive?: boolean;
  health: number;
};

export type Notification = {
  id: string;
  type: "assigned" | "completed" | "comment" | "deadline" | "ai" | "project";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  mention?: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  /** Day of month, derived from `date` */
  day: number;
  /** ISO date (yyyy-mm-dd) */
  date?: string;
  kind: "deadline" | "meeting" | "milestone" | "event";
  time: string;
  projectId?: string | null;
};

export type ActivityItem = {
  id: string;
  who: string;
  what: string;
  target: string;
  time: string;
};

export type TaskComment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  time: string;
  createdAt: string;
};

export const statusLabels: Record<Status, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export const statusOrder: Status[] = ["backlog", "todo", "in-progress", "review", "done"];

const fallbackMember: Member = {
  id: "unknown",
  name: "Unassigned",
  role: "—",
  initials: "?",
  color: "var(--electric)",
  email: "",
  activeTasks: 0,
  completedTasks: 0,
  workload: 0,
  presence: "offline",
  workspaceRole: "member",
  isCurrentUser: false,
};

/**
 * Registry of the members loaded for the signed-in user's workspace.
 * Kept in sync by NexusProvider so presentational components can resolve a
 * member by id without threading props through every layer.
 */
const memberRegistry = new Map<string, Member>();

export function setMemberRegistry(list: Member[]) {
  memberRegistry.clear();
  for (const m of list) memberRegistry.set(m.id, m);
}

export function memberById(id: string | null | undefined): Member {
  if (!id) return fallbackMember;
  return memberRegistry.get(id) ?? fallbackMember;
}

export function formatDueLabel(iso: string | null | undefined): string {
  if (!iso) return "No date";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
