import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Paperclip, Link2, Sparkles } from "lucide-react";
import {
  AIActions,
  AvatarChip,
  Panel,
  PageShellMotion,
  PriorityPill,
  ProgressBar,
  SectionTitle,
  StatusPill,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { NexusOrb } from "@/components/nexus/nexus-orb";
import { initialTasks, memberById, projectById } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks/$taskId")({
  loader: ({ params }) => {
    const exists = initialTasks.some((t) => t.id === params.taskId);
    if (!exists) throw notFound();
    return { taskId: params.taskId };
  },
  head: ({ loaderData }) => {
    const task = initialTasks.find((t) => t.id === loaderData?.taskId);
    const title = task?.title ?? "Task";
    return {
      meta: [
        { title: `${title} — NexusFlow` },
        { name: "description", content: `Subtasks, comments, dependencies and AI actions for the ${title} task.` },
        { property: "og:title", content: `${title} — NexusFlow` },
        { property: "og:description", content: `Subtasks, comments and AI actions for ${title}.` },
      ],
    };
  },
  component: TaskDetails,
});

const aiResults: Record<string, string[]> = {
  "Break Into Subtasks": ["Define API contract", "Implement retry & backoff", "Add webhook verification", "Write integration tests"],
  "Estimate Effort": ["Estimated 13 story points (~4 dev days) based on similar past tasks."],
  "Generate Acceptance Criteria": [
    "Given a valid payload, the gateway returns a 201 with a transaction id",
    "Failed calls retry 3× with exponential backoff",
    "All webhook events are verified and idempotent",
  ],
  "Suggest Priority": ["Recommended priority: High — 2 downstream tasks are blocked by this."],
  "Find Dependencies": ["Blocked by: User Authentication", "Blocks: Billing edge cases"],
};

function TaskDetails() {
  const { taskId } = Route.useLoaderData();
  const { tasks, toggleSubtask, setTaskStatus } = useNexus();
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const [ai, setAi] = useState<{ label: string; items: string[] } | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { who: "Priya", text: "Can we ship the retry logic before the webhook work?", time: "1h" },
    { who: "Ananya", text: "Sandbox keys are in the shared vault.", time: "3h" },
  ]);

  if (!task) return null;
  const project = projectById(task.projectId);
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const pct = task.subtasks.length ? Math.round((doneCount / task.subtasks.length) * 100) : 0;

  return (
    <PageShellMotion>
      <motion.div variants={fadeUp} className="mb-5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Link to="/app/tasks" className="hover:text-foreground">
          My Tasks
        </Link>
        <span>/</span>
        <span className="text-foreground/80">{task.title}</span>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={task.status} />
                <PriorityPill priority={task.priority} />
                <span className="text-[11px] text-muted-foreground">{project?.name}</span>
              </div>
              <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">{task.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(["backlog", "todo", "in-progress", "review", "done"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTaskStatus(task.id, s)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[11px] transition-colors",
                      task.status === s
                        ? "border-[oklch(0.6_0.2_272_/_0.55)] bg-[oklch(0.6_0.2_272_/_0.15)]"
                        : "border-border/70 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Move to {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title={`Subtasks · ${doneCount}/${task.subtasks.length}`} />
              <div className="p-5">
                <ProgressBar value={pct} />
                <div className="mt-4 space-y-1">
                  {task.subtasks.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface-2/50"
                    >
                      <input
                        type="checkbox"
                        checked={s.done}
                        onChange={() => toggleSubtask(task.id, s.id)}
                        className="size-3.5 accent-[oklch(0.6_0.2_272)]"
                      />
                      <span className={cn(s.done && "text-muted-foreground line-through")}>{s.title}</span>
                    </label>
                  ))}
                  {task.subtasks.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No subtasks yet — try “Break Into Subtasks”.
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Comments" />
              <div className="space-y-4 p-5">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-surface-2 text-[10px] font-semibold">
                      {c.who.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <div>
                      <p className="text-[12px]">
                        <span className="font-medium">{c.who}</span>{" "}
                        <span className="text-muted-foreground">· {c.time} ago</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!comment.trim()) return;
                    setComments((prev) => [...prev, { who: "Nisha", text: comment.trim(), time: "now" }]);
                    setComment("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment…"
                    className="h-9 flex-1 rounded-lg border border-border/70 bg-surface px-3 text-xs outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
                  />
                  <button
                    type="submit"
                    className="rounded-lg px-3 text-xs font-semibold text-primary-foreground"
                    style={{ background: "var(--gradient-ai)" }}
                  >
                    Post
                  </button>
                </form>
              </div>
            </Panel>
          </motion.div>
        </div>

        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Details" />
              <div className="space-y-3 p-5 text-[12px]">
                {[
                  ["Assignee", null],
                  ["Due date", task.due],
                  ["Project", project?.name ?? "—"],
                  ["Attachments", `${task.attachments} files`],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    {v ? (
                      <span>{v}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <AvatarChip id={task.assigneeId} size={20} /> {memberById(task.assigneeId).name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp} className="ai-border rounded-xl bg-surface p-5">
            <div className="flex items-center gap-3">
              <NexusOrb size={30} />
              <h3 className="text-sm font-semibold">Nexus AI actions</h3>
            </div>
            <div className="mt-4">
              <AIActions
                actions={Object.keys(aiResults)}
                onAction={(a) => setAi({ label: a, items: aiResults[a] ?? [] })}
              />
            </div>
            <AnimatePresence mode="wait">
              {ai && (
                <motion.div
                  key={ai.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 space-y-2"
                >
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="size-3" /> {ai.label}
                  </p>
                  {ai.items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-lg border border-border/70 bg-surface-2/60 p-2.5 text-[12px]"
                    >
                      {item}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Dependencies" />
              <div className="space-y-2 p-5 text-[12px]">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="size-3.5" /> Blocked by <span className="text-foreground">User Authentication</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="size-3.5" /> Blocks <span className="text-foreground">Billing edge cases</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Paperclip className="size-3.5" /> gateway-contract.pdf
                </p>
              </div>
            </Panel>
          </motion.div>
        </div>
      </div>
    </PageShellMotion>
  );
}
