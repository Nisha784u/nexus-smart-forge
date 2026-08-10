export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";

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
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  due: string;
  comments: number;
  attachments: number;
  subtasks: { id: string; title: string; done: boolean }[];
  tags: string[];
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
  day: number;
  kind: "deadline" | "meeting" | "milestone" | "event";
  time: string;
};

export const members: Member[] = [
  { id: "u1", name: "Nisha", role: "Product Manager", initials: "N", color: "var(--electric)", email: "nisha@nexusflow.io", activeTasks: 8, completedTasks: 62, workload: 78, presence: "online" },
  { id: "u2", name: "Priya", role: "UI/UX Designer", initials: "P", color: "var(--violet)", email: "priya@nexusflow.io", activeTasks: 11, completedTasks: 74, workload: 94, presence: "online" },
  { id: "u3", name: "Ananya", role: "Frontend Developer", initials: "A", color: "var(--cyan)", email: "ananya@nexusflow.io", activeTasks: 5, completedTasks: 48, workload: 51, presence: "away" },
  { id: "u4", name: "Sneha", role: "QA Engineer", initials: "S", color: "var(--success)", email: "sneha@nexusflow.io", activeTasks: 7, completedTasks: 39, workload: 66, presence: "online" },
  { id: "u5", name: "Rahul", role: "Backend Developer", initials: "R", color: "var(--warning)", email: "rahul@nexusflow.io", activeTasks: 9, completedTasks: 55, workload: 84, presence: "offline" },
  { id: "u6", name: "Arjun", role: "AI Engineer", initials: "A", color: "var(--violet)", email: "arjun@nexusflow.io", activeTasks: 6, completedTasks: 44, workload: 72, presence: "online" },
  { id: "u7", name: "Rohan", role: "Project Coordinator", initials: "R", color: "var(--cyan)", email: "rohan@nexusflow.io", activeTasks: 4, completedTasks: 31, workload: 45, presence: "away" },
];


export const projects: Project[] = [
  { id: "p1", name: "Mobile App", description: "Cross-platform companion app with offline sync and push workflows.", progress: 72, status: "on-track", tasksDone: 36, tasksTotal: 50, due: "Jun 14", memberIds: ["u1", "u3", "u4"], health: 84 },
  { id: "p2", name: "Website Redesign", description: "Marketing site rebuild with a new design system and CMS pipeline.", progress: 48, status: "at-risk", tasksDone: 19, tasksTotal: 40, due: "Jun 02", memberIds: ["u2", "u3"], health: 61 },
  { id: "p3", name: "Nexus AI Dashboard", description: "Realtime AI analytics surface for workspace-wide project intelligence.", progress: 90, status: "on-track", tasksDone: 45, tasksTotal: 50, due: "May 30", memberIds: ["u1", "u2", "u4", "u5"], aiActive: true, health: 90 },
  { id: "p4", name: "Marketing Website", description: "Campaign landing pages, lifecycle emails and attribution tracking.", progress: 25, status: "planning", tasksDone: 8, tasksTotal: 32, due: "Jul 09", memberIds: ["u2", "u5"], health: 72 },
];

const t = (
  id: string,
  title: string,
  projectId: string,
  status: Status,
  priority: Priority,
  assigneeId: string,
  due: string,
  extra: Partial<Task> = {},
): Task => ({
  id,
  title,
  description:
    extra.description ??
    "Integrate the payment gateway API and handle all transaction workflows, including retries, webhooks and reconciliation.",
  projectId,
  status,
  priority,
  assigneeId,
  due,
  comments: extra.comments ?? 3,
  attachments: extra.attachments ?? 1,
  subtasks:
    extra.subtasks ??
    [
      { id: id + "-s1", title: "Set up API endpoint", done: true },
      { id: id + "-s2", title: "Implement authentication", done: true },
      { id: id + "-s3", title: "Handle API responses", done: false },
      { id: id + "-s4", title: "Error handling", done: false },
    ],
  tags: extra.tags ?? ["engineering"],
});

export const initialTasks: Task[] = [
  t("t1", "API Integration", "p3", "in-progress", "high", "u1", "May 24", { comments: 6, attachments: 3 }),
  t("t2", "User Authentication", "p3", "backlog", "medium", "u5", "May 28"),
  t("t3", "Order Summary redesign", "p2", "todo", "high", "u2", "May 21", { comments: 2 }),
  t("t4", "Payment Gateway", "p1", "in-progress", "urgent", "u5", "May 20", { comments: 9, attachments: 4 }),
  t("t5", "Design System tokens", "p2", "review", "medium", "u2", "May 26"),
  t("t6", "Offline sync engine", "p1", "in-progress", "high", "u3", "May 25"),
  t("t7", "Onboarding flow", "p1", "todo", "low", "u2", "Jun 02"),
  t("t8", "Analytics events", "p3", "done", "medium", "u4", "May 12"),
  t("t9", "Push notifications", "p1", "backlog", "medium", "u3", "Jun 08"),
  t("t10", "Landing page hero", "p4", "todo", "medium", "u2", "Jun 15"),
  t("t11", "Regression test suite", "p3", "review", "high", "u4", "May 27", { comments: 4 }),
  t("t12", "Deploy pipeline", "p3", "done", "low", "u5", "May 09"),
  t("t13", "Content migration", "p4", "backlog", "low", "u5", "Jul 01"),
  t("t14", "Accessibility audit", "p2", "in-progress", "medium", "u4", "May 29"),
  t("t15", "Billing edge cases", "p1", "review", "urgent", "u5", "May 22", { comments: 7 }),
  t("t16", "Release notes", "p3", "done", "low", "u1", "May 05"),
];

export const notifications: Notification[] = [
  { id: "n1", type: "assigned", title: "New task assigned", body: "Priya assigned you “Design System tokens” in Website Redesign.", time: "2m ago", unread: true, mention: true },
  { id: "n2", type: "ai", title: "Nexus AI recommendation", body: "Testing is the bottleneck on Nexus AI Dashboard. Reassign 2 tasks to Ananya.", time: "18m ago", unread: true },
  { id: "n3", type: "comment", title: "New comment", body: "Ananya mentioned you on “API Integration”: can we ship the retry logic first?", time: "1h ago", unread: true, mention: true },
  { id: "n4", type: "deadline", title: "Deadline approaching", body: "“Payment Gateway” is due in 2 days.", time: "3h ago", unread: false },
  { id: "n5", type: "completed", title: "Task completed", body: "Sneha completed “Analytics events”.", time: "Yesterday", unread: false },
  { id: "n6", type: "project", title: "Project update", body: "Nexus AI Dashboard reached 90% completion.", time: "Yesterday", unread: false },
];

export const activity = [
  { id: "a1", who: "Nisha", what: "changed status to In Progress", target: "API Integration", time: "10m" },
  { id: "a2", who: "Priya", what: "added a comment on", target: "Design System tokens", time: "42m" },
  { id: "a3", who: "Ananya", what: "attached a file to", target: "Offline sync engine", time: "2h" },
  { id: "a4", who: "Sneha", what: "completed", target: "Analytics events", time: "5h" },
  { id: "a5", who: "Rahul", what: "opened a review on", target: "Billing edge cases", time: "8h" },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "e1", title: "Sprint planning", day: 4, kind: "meeting", time: "09:30" },
  { id: "e2", title: "API Integration due", day: 11, kind: "deadline", time: "17:00" },
  { id: "e3", title: "Design review", day: 11, kind: "meeting", time: "14:00" },
  { id: "e4", title: "Beta milestone", day: 15, kind: "milestone", time: "All day" },
  { id: "e5", title: "Payment Gateway due", day: 18, kind: "deadline", time: "18:00" },
  { id: "e6", title: "Team offsite", day: 22, kind: "event", time: "10:00" },
  { id: "e7", title: "Launch readiness", day: 26, kind: "milestone", time: "11:00" },
  { id: "e8", title: "Retro", day: 29, kind: "meeting", time: "16:00" },
];

export const taskTrend = [
  { week: "W1", created: 24, completed: 18, velocity: 32 },
  { week: "W2", created: 31, completed: 26, velocity: 38 },
  { week: "W3", created: 28, completed: 30, velocity: 41 },
  { week: "W4", created: 35, completed: 33, velocity: 46 },
  { week: "W5", created: 30, completed: 38, velocity: 52 },
  { week: "W6", created: 42, completed: 40, velocity: 58 },
];

export const statusLabels: Record<Status, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export const statusOrder: Status[] = ["backlog", "todo", "in-progress", "review", "done"];

export function memberById(id: string) {
  return (members.find((m) => m.id === id) ?? members[0]) as Member;
}
export function projectById(id: string) {
  return projects.find((p) => p.id === id);
}
