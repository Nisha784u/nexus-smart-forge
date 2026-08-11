import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MessageSquare, Paperclip, Plus, Search } from "lucide-react";
import {
  AIInsightCard,
  AvatarChip,
  PageHeader,
  PageShellMotion,
  PriorityPill,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { statusLabels, statusOrder, type Status } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/board")({
  head: () => ({
    meta: [
      { title: "Kanban Board — NexusFlow" },
      { name: "description", content: "Drag tasks across backlog, to do, in progress, review and done with AI board actions." },
      { property: "og:title", content: "Kanban Board — NexusFlow" },
      { property: "og:description", content: "Drag tasks across your workflow with AI-assisted board actions." },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const { tasks, projects, setTaskStatus, addTask } = useNexus();
  const [q, setQ] = useState("");
  const [project, setProject] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);

  const visible = tasks.filter(
    (t) => t.title.toLowerCase().includes(q.toLowerCase()) && (project === "all" || t.projectId === project),
  );

  return (
    <PageShellMotion className="max-w-none">
      <PageHeader
        title="Kanban Board"
        subtitle="Drag cards between columns — Nexus AI keeps watching for blockers."
        right={
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search board…"
                className="h-9 w-56 rounded-lg border border-border/70 bg-surface pl-9 pr-3 text-xs outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
              />
            </div>
            <select
              aria-label="Project filter"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs outline-none"
            >
              <option value="all" className="bg-popover">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-popover">
                  {p.name}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addTask({ title: "New task", status: "backlog" })}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-ai)" }}
            >
              <Plus className="size-3.5" /> Add Task
            </motion.button>
          </div>
        }
      />

      <motion.div variants={fadeUp} className="mb-5">
        <AIInsightCard
          title="Nexus AI board actions"
          body="Two review-column cards have been idle for 4+ days. Nexus AI can rebalance the board in one click."
          actions={["Prioritize Tasks", "Detect Blockers", "Suggest Assignments", "Identify Risks"]}
        />
      </motion.div>

      <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
        {statusOrder.map((col) => {
          const colTasks = visible.filter((t) => t.status === col);
          return (
            <motion.div
              key={col}
              variants={fadeUp}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col);
              }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={() => {
                if (dragId) setTaskStatus(dragId, col);
                setDragId(null);
                setOverCol(null);
              }}
              className={cn(
                "min-w-[260px] rounded-xl border border-border/70 bg-[oklch(0.185_0.026_266)] p-3 transition-colors",
                overCol === col && "border-[oklch(0.6_0.2_272_/_0.6)] bg-[oklch(0.6_0.2_272_/_0.07)]",
              )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide">{statusLabels[col]}</h3>
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {colTasks.map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      layoutId={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: dragId === t.id ? 0.5 : 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      whileHover={{ y: -2 }}
                      className={cn(
                        "cursor-grab rounded-lg border border-border/70 bg-card p-3 transition-shadow active:cursor-grabbing",
                        dragId === t.id
                          ? "shadow-[0_24px_50px_-18px_oklch(0.6_0.2_272_/_0.8)]"
                          : "hover:border-[oklch(0.6_0.2_272_/_0.45)] hover:shadow-[0_14px_36px_-22px_oklch(0.6_0.2_272)]",
                      )}
                    >
                      <Link to="/app/tasks/$taskId" params={{ taskId: t.id }} className="block text-[13px] font-medium">
                        {t.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {projects.find((p) => p.id === t.projectId)?.name}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <PriorityPill priority={t.priority} />
                        <AvatarChip id={t.assigneeId} size={22} />
                      </div>
                      <div className="mt-3 flex items-center gap-3 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3" /> {t.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Paperclip className="size-3" /> {t.attachments}
                        </span>
                        <span className="ml-auto">{t.due}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => addTask({ title: "New task", status: col })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 py-2 text-[11px] text-muted-foreground transition-colors hover:border-[oklch(0.6_0.2_272_/_0.5)] hover:text-foreground"
                >
                  <Plus className="size-3" /> Add Task
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageShellMotion>
  );
}
