import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, TrendingUp, Target, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NexusOrb } from "@/components/nexus/nexus-orb";
import {
  AnimatedNumber,
  Panel,
  PageHeader,
  PageShellMotion,
  ProgressBar,
  SectionTitle,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { useNexus } from "@/lib/nexus-store";

export const Route = createFileRoute("/app/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — NexusFlow" },
      { name: "description", content: "Predictive delivery forecasts, risk scores and bottleneck detection across your portfolio." },
      { property: "og:title", content: "AI Insights — NexusFlow" },
      { property: "og:description", content: "Predictive forecasts, risk scores and bottleneck detection." },
    ],
  }),
  component: InsightsPage,
});


const radar = [
  { axis: "Velocity", score: 82 },
  { axis: "Quality", score: 74 },
  { axis: "Capacity", score: 61 },
  { axis: "Scope", score: 68 },
  { axis: "Focus", score: 88 },
];

const risks = [
  { title: "Website Redesign may slip 6 days", level: "High", why: "Design QA queue grew 3× in two weeks." },
  { title: "Payment Gateway is single-owner", level: "Medium", why: "Rohan owns 4 of 5 critical-path tasks." },
  { title: "Review column ageing", level: "Medium", why: "2 cards idle for 4+ days." },
];

const kpis = [
  { label: "Predicted on-time delivery", value: 87, suffix: "%", icon: Target },
  { label: "Portfolio risk score", value: 32, suffix: "/100", icon: AlertTriangle },
  { label: "Velocity trend", value: 13, suffix: "% ↑", icon: TrendingUp },
  { label: "AI actions this week", value: 46, suffix: "", icon: Zap },
];

function InsightsPage() {
  const { projects, taskTrend } = useNexus();
  const forecast = taskTrend.map((d, i) => ({
    week: d.week,
    actual: d.completed,
    predicted: Math.round(d.completed * (1 + i * 0.04) + 4),
  }));
  return (
    <PageShellMotion>
      <PageHeader title="AI Insights" subtitle="Predictive analytics across every project in the workspace." />

      <motion.div variants={fadeUp} className="mb-5 grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5">
            <k.icon className="size-4 text-[oklch(0.72_0.16_280)]" />
            <p className="mt-3 font-display text-2xl font-semibold">
              <AnimatedNumber value={k.value} />
              {k.suffix}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Completion forecast" />
              <div className="h-[260px] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                    <defs>
                      <linearGradient id="ins-a" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.22 300)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="oklch(0.62 0.22 300)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 265)" vertical={false} />
                    <XAxis dataKey="week" stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.2 0.03 266)",
                        border: "1px solid oklch(0.32 0.04 266)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="actual" stroke="oklch(0.62 0.22 300)" fill="url(#ins-a)" strokeWidth={2} />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="oklch(0.68 0.17 249)"
                      strokeDasharray="5 4"
                      fill="transparent"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-2">
            <Panel>
              <SectionTitle title="Team health radar" />
              <div className="h-[240px] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="oklch(0.32 0.04 266)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.62 0.03 265)", fontSize: 11 }} />
                    <Radar
                      dataKey="score"
                      stroke="oklch(0.62 0.22 300)"
                      fill="oklch(0.62 0.22 300)"
                      fillOpacity={0.28}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel>
              <SectionTitle title="Velocity" />
              <div className="h-[240px] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taskTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 265)" vertical={false} />
                    <XAxis dataKey="week" stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.2 0.03 266)",
                        border: "1px solid oklch(0.32 0.04 266)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="velocity" stroke="oklch(0.68 0.17 249)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </motion.div>
        </div>

        <div className="space-y-5">
          <motion.div variants={fadeUp} className="ai-border rounded-xl bg-surface p-5">
            <div className="flex items-center gap-3">
              <NexusOrb size={30} />
              <h3 className="text-sm font-semibold">Risk detection</h3>
            </div>
            <div className="mt-4 space-y-2.5">
              {risks.map((r) => (
                <div key={r.title} className="rounded-lg border border-border/70 bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] font-medium">{r.title}</p>
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: r.level === "High" ? "oklch(0.7 0.21 18 / 0.16)" : "oklch(0.8 0.15 85 / 0.16)",
                        color: r.level === "High" ? "oklch(0.8 0.14 25)" : "oklch(0.86 0.12 90)",
                      }}
                    >
                      {r.level}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{r.why}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Project health" />
              <div className="space-y-4 p-5">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="mb-1.5 flex items-center justify-between text-[12px]">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">{p.health}</span>
                    </div>
                    <ProgressBar value={p.health} />
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
