// PREVIEW-ONLY mock data. Temporary file for visual inspection.
// Safe to delete. Not intended to be committed.
import { formatDueLabel, formatRelativeTime, type CalendarEvent } from "./nexus-data";
import type { WorkspaceSnapshot } from "./nexus-api";

const DAY = 86400000;
const now = Date.now();
const iso = (offsetDays: number) => new Date(now + offsetDays * DAY).toISOString();
const isoDate = (offsetDays: number) => new Date(now + offsetDays * DAY).toISOString().slice(0, 10);

const members: WorkspaceSnapshot["members"] = [
  { id: "m1", name: "Alex Rivera", role: "Product Lead", initials: "AR", color: "var(--electric)", email: "alex@nexusflow.app", activeTasks: 4, completedTasks: 18, workload: 72, presence: "online", workspaceRole: "owner", isCurrentUser: true },
  { id: "m2", name: "Priya Shah", role: "Senior Engineer", initials: "PS", color: "var(--violet)", email: "priya@nexusflow.app", activeTasks: 6, completedTasks: 24, workload: 88, presence: "online", workspaceRole: "admin", isCurrentUser: false },
  { id: "m3", name: "Marcus Lee", role: "Designer", initials: "ML", color: "var(--cyan)", email: "marcus@nexusflow.app", activeTasks: 3, completedTasks: 15, workload: 54, presence: "away", workspaceRole: "member", isCurrentUser: false },
  { id: "m4", name: "Sofia Gomez", role: "Marketing", initials: "SG", color: "var(--amber)", email: "sofia@nexusflow.app", activeTasks: 2, completedTasks: 11, workload: 36, presence: "offline", workspaceRole: "member", isCurrentUser: false },
  { id: "m5", name: "Devon Clarke", role: "Data Scientist", initials: "DC", color: "var(--electric)", email: "devon@nexusflow.app", activeTasks: 5, completedTasks: 20, workload: 80, presence: "online", workspaceRole: "member", isCurrentUser: false },
  { id: "m6", name: "Nina Patel", role: "QA Engineer", initials: "NP", color: "var(--violet)", email: "nina@nexusflow.app", activeTasks: 3, completedTasks: 13, workload: 48, presence: "away", workspaceRole: "member", isCurrentUser: false },
];

const projects: WorkspaceSnapshot["projects"] = [
  { id: "p1", name: "Mobile App", description: "Native iOS and Android apps with offline sync and push notifications.", progress: 72, status: "on-track", tasksDone: 18, tasksTotal: 25, due: formatDueLabel(isoDate(21)), dueDate: isoDate(21), memberIds: ["m1", "m2", "m3"], aiActive: true, health: 86 },
  { id: "p2", name: "Website Redesign", description: "Marketing site refresh with a new design system and CMS migration.", progress: 48, status: "at-risk", tasksDone: 9, tasksTotal: 19, due: formatDueLabel(isoDate(9)), dueDate: isoDate(9), memberIds: ["m3", "m4"], aiActive: false, health: 61 },
  { id: "p3", name: "Marketing Campaign", description: "Q3 product launch campaign across email, social, and paid channels.", progress: 25, status: "planning", tasksDone: 4, tasksTotal: 16, due: formatDueLabel(isoDate(34)), dueDate: isoDate(34), memberIds: ["m4", "m1"], aiActive: true, health: 74 },
  { id: "p4", name: "Nexus AI", description: "AI insight engine, task generation, and predictive workload balancing.", progress: 90, status: "on-track", tasksDone: 27, tasksTotal: 30, due: formatDueLabel(isoDate(5)), dueDate: isoDate(5), memberIds: ["m5", "m2", "m1"], aiActive: true, health: 93 },
  { id: "p5", name: "Design System", description: "Shared component library, tokens, and documentation for all products.", progress: 61, status: "on-track", tasksDone: 14, tasksTotal: 23, due: formatDueLabel(isoDate(16)), dueDate: isoDate(16), memberIds: ["m3", "m6"], aiActive: false, health: 79 },
];

type RawTask = {
  id: string; title: string; description: string; projectId: string;
  status: WorkspaceSnapshot["tasks"][number]["status"];
  priority: WorkspaceSnapshot["tasks"][number]["priority"];
  assigneeId: string; dueOffset: number; createdOffset: number; updatedOffset: number;
  tags: string[]; subtasks: { title: string; done: boolean }[]; comments: number; attachments: number;
};

const rawTasks: RawTask[] = [
  { id: "t1", title: "Implement offline sync engine", description: "Build a conflict-free replicated data layer so the mobile app works without a connection.", projectId: "p1", status: "in-progress", priority: "high", assigneeId: "m2", dueOffset: 4, createdOffset: -12, updatedOffset: -1, tags: ["mobile", "backend"], subtasks: [{ title: "Design CRDT schema", done: true }, { title: "Local queue", done: true }, { title: "Merge resolver", done: false }], comments: 3, attachments: 2 },
  { id: "t2", title: "Push notification service", description: "Integrate APNs and FCM with per-user topic subscriptions.", projectId: "p1", status: "todo", priority: "medium", assigneeId: "m5", dueOffset: 8, createdOffset: -6, updatedOffset: -2, tags: ["mobile", "infra"], subtasks: [{ title: "APNs cert", done: false }, { title: "FCM setup", done: false }], comments: 1, attachments: 0 },
  { id: "t3", title: "Onboarding flow redesign", description: "New 3-step onboarding with progress and skip options.", projectId: "p1", status: "review", priority: "medium", assigneeId: "m3", dueOffset: 2, createdOffset: -9, updatedOffset: 0, tags: ["design", "mobile"], subtasks: [{ title: "Wireframes", done: true }, { title: "Prototype", done: true }], comments: 5, attachments: 4 },
  { id: "t4", title: "Migrate CMS content", description: "Move all marketing pages to the new headless CMS.", projectId: "p2", status: "in-progress", priority: "urgent", assigneeId: "m4", dueOffset: 1, createdOffset: -8, updatedOffset: 0, tags: ["web", "content"], subtasks: [{ title: "Export legacy", done: true }, { title: "Map schema", done: false }, { title: "Import", done: false }], comments: 2, attachments: 1 },
  { id: "t5", title: "Responsive nav bar", description: "Rebuild the top navigation with the new design system.", projectId: "p2", status: "todo", priority: "low", assigneeId: "m3", dueOffset: 6, createdOffset: -5, updatedOffset: -3, tags: ["web", "design"], subtasks: [{ title: "Mobile menu", done: false }], comments: 0, attachments: 0 },
  { id: "t6", title: "Launch email sequence", description: "Draft and schedule the 5-part launch email drip.", projectId: "p3", status: "backlog", priority: "medium", assigneeId: "m4", dueOffset: 20, createdOffset: -3, updatedOffset: -3, tags: ["marketing"], subtasks: [], comments: 1, attachments: 0 },
  { id: "t7", title: "Paid ads creative", description: "Produce banner and video creative for the paid campaign.", projectId: "p3", status: "todo", priority: "medium", assigneeId: "m1", dueOffset: 14, createdOffset: -4, updatedOffset: -2, tags: ["marketing", "design"], subtasks: [{ title: "Static banners", done: false }, { title: "Video cut", done: false }], comments: 0, attachments: 3 },
  { id: "t8", title: "Insight ranking model", description: "Train the model that prioritizes daily AI insights per user.", projectId: "p4", status: "in-progress", priority: "high", assigneeId: "m5", dueOffset: 3, createdOffset: -14, updatedOffset: 0, tags: ["ai", "ml"], subtasks: [{ title: "Feature set", done: true }, { title: "Train v1", done: true }, { title: "Eval", done: false }], comments: 4, attachments: 1 },
  { id: "t9", title: "Task generator prompts", description: "Refine the prompt templates for the AI task generator.", projectId: "p4", status: "done", priority: "medium", assigneeId: "m2", dueOffset: -2, createdOffset: -16, updatedOffset: -1, tags: ["ai"], subtasks: [{ title: "Template A", done: true }, { title: "Template B", done: true }], comments: 2, attachments: 0 },
  { id: "t10", title: "Predictive workload balancer", description: "Suggest reassignments when a member is overloaded.", projectId: "p4", status: "done", priority: "high", assigneeId: "m5", dueOffset: -4, createdOffset: -18, updatedOffset: -3, tags: ["ai", "ml"], subtasks: [{ title: "Load metric", done: true }], comments: 1, attachments: 0 },
  { id: "t11", title: "Button & input tokens", description: "Finalize color and spacing tokens for form controls.", projectId: "p5", status: "review", priority: "low", assigneeId: "m3", dueOffset: 5, createdOffset: -7, updatedOffset: 0, tags: ["design-system"], subtasks: [{ title: "Light theme", done: true }, { title: "Dark theme", done: true }], comments: 3, attachments: 2 },
  { id: "t12", title: "Component docs site", description: "Publish the Storybook-based documentation site.", projectId: "p5", status: "todo", priority: "medium", assigneeId: "m6", dueOffset: 11, createdOffset: -6, updatedOffset: -4, tags: ["design-system", "docs"], subtasks: [{ title: "Setup", done: true }, { title: "Write MDX", done: false }], comments: 0, attachments: 0 },
  { id: "t13", title: "Accessibility audit", description: "Run a full WCAG 2.2 audit across the component library.", projectId: "p5", status: "backlog", priority: "high", assigneeId: "m6", dueOffset: 18, createdOffset: -2, updatedOffset: -2, tags: ["a11y", "qa"], subtasks: [], comments: 0, attachments: 0 },
  { id: "t14", title: "Crash reporting dashboard", description: "Wire Sentry release health into the internal dashboard.", projectId: "p1", status: "done", priority: "medium", assigneeId: "m2", dueOffset: -6, createdOffset: -20, updatedOffset: -5, tags: ["mobile", "infra"], subtasks: [{ title: "SDK", done: true }], comments: 1, attachments: 0 },
];

const tasks: WorkspaceSnapshot["tasks"] = rawTasks.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  projectId: t.projectId,
  status: t.status,
  priority: t.priority,
  assigneeId: t.assigneeId,
  due: formatDueLabel(isoDate(t.dueOffset)),
  dueDate: isoDate(t.dueOffset),
  comments: t.comments,
  attachments: t.attachments,
  subtasks: t.subtasks.map((s, i) => ({ id: `${t.id}-s${i}`, title: s.title, done: s.done })),
  tags: t.tags,
  createdAt: iso(t.createdOffset),
  updatedAt: iso(t.updatedOffset),
}));

const comments: WorkspaceSnapshot["comments"] = [
  { id: "c1", taskId: "t1", authorId: "m1", body: "Let's make sure the merge resolver handles deleted records too.", time: formatRelativeTime(iso(-0.1)), createdAt: iso(-0.1) },
  { id: "c2", taskId: "t1", authorId: "m2", body: "Good call — I'll add tombstones to the CRDT schema.", time: formatRelativeTime(iso(-0.05)), createdAt: iso(-0.05) },
  { id: "c3", taskId: "t3", authorId: "m3", body: "Prototype is ready for review in Figma.", time: formatRelativeTime(iso(-0.3)), createdAt: iso(-0.3) },
  { id: "c4", taskId: "t8", authorId: "m5", body: "v1 eval looks promising, precision is up 12%.", time: formatRelativeTime(iso(-0.2)), createdAt: iso(-0.2) },
  { id: "c5", taskId: "t11", authorId: "m3", body: "Dark theme tokens merged, please re-review.", time: formatRelativeTime(iso(-0.5)), createdAt: iso(-0.5) },
];

const notifications: WorkspaceSnapshot["notifications"] = [
  { id: "n1", type: "assigned", title: "New task assigned", body: "Alex assigned you “Paid ads creative”.", time: formatRelativeTime(iso(-0.02)), unread: true, mention: false },
  { id: "n2", type: "comment", title: "New comment", body: "Priya mentioned you on “Implement offline sync engine”.", time: formatRelativeTime(iso(-0.1)), unread: true, mention: true },
  { id: "n3", type: "ai", title: "Nexus AI insight", body: "Website Redesign is trending at-risk — 2 tasks slipped this week.", time: formatRelativeTime(iso(-0.4)), unread: true, mention: false },
  { id: "n4", type: "completed", title: "Task completed", body: "Devon completed “Predictive workload balancer”.", time: formatRelativeTime(iso(-1)), unread: false, mention: false },
  { id: "n5", type: "deadline", title: "Deadline approaching", body: "“Migrate CMS content” is due tomorrow.", time: formatRelativeTime(iso(-1.2)), unread: false, mention: false },
  { id: "n6", type: "project", title: "Project update", body: "Nexus AI reached 90% completion.", time: formatRelativeTime(iso(-2)), unread: false, mention: false },
];

const events: CalendarEvent[] = [
  { id: "e1", title: "CMS content due", day: Number(isoDate(1).slice(8, 10)), date: isoDate(1), kind: "deadline", time: "5:00 PM", projectId: "p2" },
  { id: "e2", title: "Design review", day: Number(isoDate(2).slice(8, 10)), date: isoDate(2), kind: "meeting", time: "10:30 AM", projectId: "p1" },
  { id: "e3", title: "Nexus AI ship", day: Number(isoDate(5).slice(8, 10)), date: isoDate(5), kind: "milestone", time: "All day", projectId: "p4" },
  { id: "e4", title: "Sprint planning", day: Number(isoDate(3).slice(8, 10)), date: isoDate(3), kind: "meeting", time: "9:00 AM", projectId: null },
  { id: "e5", title: "Website launch", day: Number(isoDate(9).slice(8, 10)), date: isoDate(9), kind: "milestone", time: "All day", projectId: "p2" },
  { id: "e6", title: "Marketing sync", day: Number(isoDate(7).slice(8, 10)), date: isoDate(7), kind: "meeting", time: "2:00 PM", projectId: "p3" },
  { id: "e7", title: "QA freeze", day: Number(isoDate(12).slice(8, 10)), date: isoDate(12), kind: "deadline", time: "6:00 PM", projectId: "p5" },
];

const activity: WorkspaceSnapshot["activity"] = [
  { id: "a1", who: "Priya Shah", what: "commented on", target: "Implement offline sync engine", time: formatRelativeTime(iso(-0.05)) },
  { id: "a2", who: "Marcus Lee", what: "moved to review", target: "Onboarding flow redesign", time: formatRelativeTime(iso(-0.2)) },
  { id: "a3", who: "Devon Clarke", what: "completed", target: "Predictive workload balancer", time: formatRelativeTime(iso(-1)) },
  { id: "a4", who: "Sofia Gomez", what: "created", target: "Launch email sequence", time: formatRelativeTime(iso(-1.5)) },
  { id: "a5", who: "Alex Rivera", what: "created the project", target: "Marketing Campaign", time: formatRelativeTime(iso(-2)) },
  { id: "a6", who: "Nina Patel", what: "updated", target: "Component docs site", time: formatRelativeTime(iso(-2.4)) },
  { id: "a7", who: "Priya Shah", what: "completed", target: "Task generator prompts", time: formatRelativeTime(iso(-3)) },
];

export const mockSnapshot: WorkspaceSnapshot = {
  workspaceId: "mock-workspace",
  workspaceName: "Acme Workspace",
  currentProfileId: "m1",
  members,
  projects,
  tasks,
  comments,
  notifications,
  events,
  activity,
};
