import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { MessageSquare, Paperclip, Search } from "lucide-react";
import {
  AIInsightCard,
  AnimatedNumber,
  AvatarChip,
  Panel,
  PageHeader,
  PageShellMotion,
  PriorityPill,
  SectionTitle,
  StatusPill,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { statusOrder, statusLabels, type Priority, type Status } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks/")({
  head: () => ({
    meta: [
      { title: "My Tasks — NexusFlow" },
      { name: "description", content: "Filter, search and complete your assigned work across every NexusFlow project." },
      { property: "og:title", content: "My Tasks — NexusFlow" },
      { property: "og:description", content: "Filter, search and complete your assigned work across every project." },
    ],
  }),
  component: TasksPage,
});

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs text-foreground/90 outline-none transition-colors hover:border-[oklch(0.6_0.2_272_/_0.4)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-popover">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TasksPage() {
  const { tasks, projects, toggleTaskDone } = useNexus();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [project, setProject] = useState("all");
  const [assignee, setAssignee] = useState("all");

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q.toLowerCase()) &&
          (status === "all" || t.status === (status as Status)) &&
          (priority === "all" || t.priority === (priority as Priority)) &&
          (project === "all" || t.projectId === project) &&
          (assignee === "all" || t.assigneeId === assignee),
      ),
    [tasks, q, status, priority, project, assignee],
  );

  const summary = [
    { label: "Today's Tasks", value: 6 },
    { label: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length },
    { label: "Completed", value: tasks.filter((t) => t.status === "done").length },
    { label: "Overdue", value: 3 },
  ];

  return (
    <PageShellMotion>
      <PageHeader title="My Tasks" subtitle="Everything assigned across your workspace, in one focused list." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Panel hover className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                <AnimatedNumber value={s.value} />
              </p>
            </Panel>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeUp} className="mt-5">
        <AIInsightCard
          title="Nexus AI"
          body="You have 3 high-priority tasks due this week. Two of them depend on the payment gateway review."
          actions={["Prioritize Tasks", "Create Schedule", "Find Delays"]}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mt-5">
        <Panel>
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border/70 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks…"
                className="h-9 w-full rounded-lg border border-border/70 bg-surface pl-9 pr-3 text-xs outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
              />
            </div>
            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={[{ value: "all", label: "All statuses" }, ...statusOrder.map((s) => ({ value: s, label: statusLabels[s] }))]}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={[
                { value: "all", label: "All priorities" },
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <Select
              label="Project"
              value={project}
              onChange={setProject}
              options={[{ value: "all", label: "All projects" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            />
            <Select
              label="Assignee"
              value={assignee}
              onChange={setAssignee}
              options={[
                { value: "all", label: "Anyone" },
                { value: "u1", label: "Nisha Rao" },
                { value: "u2", label: "Priya Menon" },
                { value: "u3", label: "Arjun Mehta" },
                { value: "u4", label: "Kavya Iyer" },
                { value: "u5", label: "Rohan Shah" },
                { value: "u6", label: "Ishaan Verma" },
                { value: "u7", label: "Riya Kapoor" },
              ]}
            />
          </div>
          <SectionTitle title={`${filtered.length} tasks`} />
          <div className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {filtered.map((t, i) => {
                const done = t.status === "done";
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.02, 0.2) }}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/40"
                  >
                    <button
                      onClick={() => toggleTaskDone(t.id)}
                      aria-label="Toggle complete"
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[5px] border transition-all",
                        done ? "border-transparent bg-[oklch(0.75_0.16_160)]" : "border-border hover:border-[oklch(0.6_0.2_272)]",
                      )}
                    >
                      {done && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} viewBox="0 0 12 12" className="size-3">
                          <path d="M2 6.5 4.6 9 10 3.5" fill="none" stroke="oklch(0.16 0.03 265)" strokeWidth="2" strokeLinecap="round" />
                        </motion.svg>
                      )}
                    </button>
                    <Link
                      to="/app/tasks/$taskId"
                      params={{ taskId: t.id }}
                      className={cn("min-w-0 flex-1 truncate text-sm", done && "text-muted-foreground line-through")}
                    >
                      {t.title}
                    </Link>
                    <span className="hidden w-40 truncate text-[11px] text-muted-foreground lg:block">
                      {projects.find((p) => p.id === t.projectId)?.name}
                    </span>
                    <PriorityPill priority={t.priority} />
                    <div className="hidden md:block">
                      <StatusPill status={t.status} />
                    </div>
                    <span className="hidden w-14 text-right text-[11px] text-muted-foreground sm:block">{t.due}</span>
                    <span className="hidden items-center gap-1 text-[11px] text-muted-foreground lg:flex">
                      <MessageSquare className="size-3" /> {t.comments}
                      <Paperclip className="ml-2 size-3" /> {t.attachments}
                    </span>
                    <AvatarChip id={t.assigneeId} size={24} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">No tasks match these filters.</p>
            )}
          </div>
        </Panel>
      </motion.div>
    </PageShellMotion>
  );
}
