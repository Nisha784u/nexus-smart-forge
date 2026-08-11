import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Users } from "lucide-react";
import {
  AIInsightCard,
  AvatarStack,
  Panel,
  PageShellMotion,
  PriorityPill,
  ProgressBar,
  SectionTitle,
  StatusPill,
  fadeUp,
} from "@/components/nexus/ui-bits";

import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: ({ params }) => ({ projectId: params.projectId }),
  head: () => {
    const name = "Project";
    return {
      meta: [
        { title: `${name} — NexusFlow` },
        { name: "description", content: `Progress, milestones, health and AI insights for the ${name} project.` },
        { property: "og:title", content: `${name} — NexusFlow` },
        { property: "og:description", content: `Progress, milestones and AI insights for ${name}.` },
      ],
    };
  },
  component: ProjectDetails,
});

const tabs = ["Overview", "Board", "Tasks", "Calendar", "Files", "Activity"] as const;

const milestones = [
  { name: "Discovery & specs", done: true, date: "Apr 12" },
  { name: "Design system ready", done: true, date: "Apr 28" },
  { name: "Core build complete", done: true, date: "May 16" },
  { name: "QA & hardening", done: false, date: "May 27" },
  { name: "Public launch", done: false, date: "Jun 04" },
];

function ProjectDetails() {
  const { projectId } = Route.useLoaderData();
  const { tasks, projects, activity, loading } = useNexus();
  const project = projects.find((p) => p.id === projectId);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  if (!project) {
    return (
      <PageShellMotion>
        <motion.div variants={fadeUp} className="p-10 text-center text-sm text-muted-foreground">
          {loading ? "Loading project…" : "This project is no longer available in your workspace."}
        </motion.div>
      </PageShellMotion>
    );
  }

  return (
    <PageShellMotion>
      <motion.div variants={fadeUp} className="mb-5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Link to="/app/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{project.name}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{project.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> {project.tasksDone}/{project.tasksTotal} tasks
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> Due {project.due}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" /> {project.memberIds.length} members
            </span>
            <AvatarStack ids={project.memberIds} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={project.progress} className="max-w-md" />
          <span className="text-sm font-semibold">{project.progress}% complete</span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-5 flex gap-1 border-b border-border/70">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {tab === t && (
              <motion.span
                layoutId="project-tab"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                style={{ background: "var(--gradient-ai)" }}
              />
            )}
          </button>
        ))}
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {tab === "Board" ? (
            <motion.div variants={fadeUp}>
              <Panel className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  This project&apos;s board lives in the workspace Kanban.{" "}
                  <Link to="/app/board" className="text-[oklch(0.78_0.13_250)] hover:underline">
                    Open Kanban Board
                  </Link>
                </p>
              </Panel>
            </motion.div>
          ) : tab === "Files" ? (
            <motion.div variants={fadeUp}>
              <Panel>
                <SectionTitle title="Files" />
                <div className="divide-y divide-border/60">
                  {["Product spec v3.pdf", "API contract.md", "QA checklist.xlsx", "Launch brief.docx"].map((f) => (
                    <div key={f} className="flex items-center justify-between px-5 py-3 text-sm">
                      <span>{f}</span>
                      <span className="text-[11px] text-muted-foreground">Updated May 18</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          ) : tab === "Activity" ? (
            <motion.div variants={fadeUp}>
              <Panel>
                <SectionTitle title="Activity" />
                <div className="space-y-3 p-5">
                  {activity.map((a) => (
                    <p key={a.id} className="text-[13px] text-muted-foreground">
                      <span className="font-medium text-foreground">{a.who}</span> {a.what}{" "}
                      <span className="text-foreground/90">{a.target}</span> · {a.time}
                    </p>
                  ))}
                </div>
              </Panel>
            </motion.div>
          ) : tab === "Calendar" ? (
            <motion.div variants={fadeUp}>
              <Panel className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Deadlines for this project appear in the{" "}
                  <Link to="/app/calendar" className="text-[oklch(0.78_0.13_250)] hover:underline">
                    workspace calendar
                  </Link>
                  .
                </p>
              </Panel>
            </motion.div>
          ) : (
            <>
              {tab === "Overview" && (
                <motion.div variants={fadeUp}>
                  <Panel>
                    <SectionTitle title="Milestones" />
                    <div className="space-y-4 p-5">
                      {milestones.map((m, i) => (
                        <div key={m.name} className="flex items-center gap-4">
                          <div className="relative flex flex-col items-center">
                            <span
                              className={cn(
                                "size-2.5 rounded-full",
                                m.done ? "bg-[oklch(0.75_0.16_160)]" : "border border-border bg-surface-2",
                              )}
                            />
                            {i < milestones.length - 1 && <span className="absolute top-3 h-6 w-px bg-border" />}
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm", !m.done && "text-muted-foreground")}>{m.name}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{m.date}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </motion.div>
              )}
              <motion.div variants={fadeUp}>
                <Panel>
                  <SectionTitle title={tab === "Tasks" ? "All tasks" : "Current tasks"} />
                  <div className="divide-y divide-border/60">
                    {projectTasks.map((t) => (
                      <Link
                        key={t.id}
                        to="/app/tasks/$taskId"
                        params={{ taskId: t.id }}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/40"
                      >
                        <span className="flex-1 truncate text-sm">{t.title}</span>
                        <PriorityPill priority={t.priority} />
                        <StatusPill status={t.status} />
                        <span className="w-14 text-right text-[11px] text-muted-foreground">{t.due}</span>
                      </Link>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            </>
          )}
        </div>

        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Project health" />
              <div className="space-y-4 p-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold">{project.health}%</span>
                  <span className="text-xs text-[oklch(0.75_0.16_160)]">Healthy</span>
                </div>
                {[
                  { k: "Timeline", v: "On track", pct: 88 },
                  { k: "Team workload", v: "82%", pct: 82 },
                  { k: "Risk", v: "Low", pct: 22 },
                ].map((r) => (
                  <div key={r.k}>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted-foreground">{r.k}</span>
                      <span>{r.v}</span>
                    </div>
                    <ProgressBar value={r.pct} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          <AIInsightCard
            body={
              <div className="space-y-2">
                <p>Project is ahead of schedule. Testing is the current bottleneck.</p>
                <ul className="space-y-1 text-[12px]">
                  <li>• 3 tasks completed ahead of schedule</li>
                  <li>• 2 testing tasks remaining</li>
                  <li>• Recommended launch window: Jun 02 – Jun 06</li>
                </ul>
              </div>
            }
            actions={["Rebalance workload", "Ask Nexus AI"]}
          />

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Other projects" />
              <div className="divide-y divide-border/60">
                {projects
                  .filter((p) => p.id !== project.id)
                  .map((p) => (
                    <Link
                      key={p.id}
                      to="/app/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-surface-2/40"
                    >
                      {p.name}
                      <span className="text-[11px] text-muted-foreground">{p.progress}%</span>
                    </Link>
                  ))}
              </div>
            </Panel>
          </motion.div>
        </div>
      </div>
    </PageShellMotion>
  );
}
