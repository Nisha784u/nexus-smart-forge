import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, CheckCircle2, Clock, FolderKanban, TrendingUp } from "lucide-react";
import {
  AIInsightCard,
  AnimatedNumber,
  AvatarStack,
  Panel,
  PageHeader,
  PageShellMotion,
  PriorityPill,
  ProgressBar,
  SectionTitle,
  StatusPill,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { memberById } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NexusFlow" },
      { name: "description", content: "Workspace overview: project progress, task analytics, deadlines and AI insights." },
      { property: "og:title", content: "Dashboard — NexusFlow" },
      { property: "og:description", content: "Workspace overview with project progress, analytics and AI insights." },
    ],
  }),
  component: DashboardPage,
});

const kpis = [
  { label: "Active Projects", value: 24, delta: "+3 this month", icon: FolderKanban },
  { label: "Tasks Completed", value: 156, delta: "+18% vs last month", icon: CheckCircle2 },
  { label: "Overdue Tasks", value: 7, delta: "-2 since Monday", icon: Clock },
  { label: "Team Productivity", value: 87, suffix: "%", delta: "+4 pts", icon: TrendingUp },
];

function DashboardPage() {
  const { tasks, projects, activity, taskTrend } = useNexus();
  const myTasks = tasks.filter((t) => t.assigneeId === "u1").slice(0, 5);

  return (
    <PageShellMotion>
      <PageHeader
        title={
          <>
            Good morning, Nisha <span className="ml-1">👋</span>
          </>
        }
        subtitle="Here's what's happening across your workspace today."
        right={
          <Link
            to="/app/insights"
            className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-2 text-xs font-medium transition-colors hover:border-[oklch(0.6_0.2_272_/_0.45)]"
          >
            View AI insights <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <motion.div key={k.label} variants={fadeUp}>
            <Panel hover className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <k.icon className="size-4 text-[oklch(0.7_0.15_255)]" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-tight">
                <AnimatedNumber value={k.value} suffix={k.suffix ?? ""} />
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{k.delta}</p>
            </Panel>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle
                title="Task analytics"
                action={<span className="text-[11px] text-muted-foreground">Last 6 weeks</span>}
              />
              <div className="h-[260px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskTrend}>
                    <defs>
                      <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.68 0.17 249)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.68 0.17 249)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 300)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="oklch(0.62 0.22 300)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 266)" vertical={false} />
                    <XAxis dataKey="week" stroke="oklch(0.68 0.026 258)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.68 0.026 258)" fontSize={11} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.21 0.03 266)",
                        border: "1px solid oklch(0.3 0.03 266)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="oklch(0.68 0.17 249)" fill="url(#gCompleted)" strokeWidth={2} />
                    <Area type="monotone" dataKey="created" stroke="oklch(0.62 0.22 300)" fill="url(#gCreated)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle
                title="Project progress"
                action={
                  <Link to="/app/projects" className="text-[11px] text-[oklch(0.78_0.13_250)] hover:underline">
                    All projects
                  </Link>
                }
              />
              <div className="divide-y divide-border/60">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to="/app/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.aiActive && (
                          <span className="rounded-full border border-[oklch(0.6_0.2_272_/_0.4)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[oklch(0.8_0.12_290)]">
                            AI
                          </span>
                        )}
                      </div>
                      <ProgressBar value={p.progress} className="mt-2" />
                    </div>
                    <AvatarStack ids={p.memberIds} size={22} />
                    <span className="w-10 text-right text-sm font-semibold tabular-nums">{p.progress}%</span>
                  </Link>
                ))}
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle
                title="My tasks"
                action={
                  <Link to="/app/tasks" className="text-[11px] text-[oklch(0.78_0.13_250)] hover:underline">
                    Open task list
                  </Link>
                }
              />
              <div className="divide-y divide-border/60">
                {myTasks.map((t) => (
                  <Link
                    key={t.id}
                    to="/app/tasks/$taskId"
                    params={{ taskId: t.id }}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/50"
                  >
                    <span className="size-2 rounded-full" style={{ background: memberById(t.assigneeId).color }} />
                    <span className="flex-1 truncate text-sm">{t.title}</span>
                    <PriorityPill priority={t.priority} />
                    <StatusPill status={t.status} />
                    <span className="w-14 text-right text-[11px] text-muted-foreground">{t.due}</span>
                  </Link>
                ))}
              </div>
            </Panel>
          </motion.div>
        </div>

        <div className="space-y-5">
          <AIInsightCard
            body={
              <>
                Your <span className="font-medium text-foreground">Nexus AI Dashboard</span> project is 90% complete.
                Testing is currently the main bottleneck — two QA tasks are blocking the release candidate.
              </>
            }
            actions={["View Insights", "Ask Nexus AI"]}
          />

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Upcoming deadlines" />
              <div className="space-y-1 p-3">
                {[
                  { t: "API Integration", p: "Nexus AI Dashboard", d: "May 24" },
                  { t: "Billing edge cases", p: "Mobile App", d: "May 22" },
                  { t: "Design System tokens", p: "Website Redesign", d: "May 26" },
                  { t: "Landing page hero", p: "Marketing Website", d: "Jun 15" },
                ].map((d) => (
                  <div key={d.t} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2/50">
                    <div className="flex size-9 flex-col items-center justify-center rounded-lg border border-border/70 bg-surface-2 text-[10px] leading-none">
                      <span className="text-muted-foreground">{d.d.split(" ")[0]}</span>
                      <span className="mt-0.5 font-semibold">{d.d.split(" ")[1]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{d.t}</p>
                      <p className="text-[11px] text-muted-foreground">{d.p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Recent activity" />
              <div className="space-y-3 p-4">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3 text-[12px]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.6_0.2_272)]" />
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{a.who}</span> {a.what}{" "}
                      <span className="text-foreground/90">{a.target}</span>
                      <span className="ml-1.5 text-muted-foreground/70">· {a.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>
        </div>
      </div>
    </PageShellMotion>
  );
}
