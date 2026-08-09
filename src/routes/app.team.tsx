import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AIInsightCard,
  Panel,
  PageHeader,
  PageShellMotion,
  ProgressBar,
  SectionTitle,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { activity, members } from "@/lib/nexus-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/team")({
  head: () => ({
    meta: [
      { title: "Team & Workload — NexusFlow" },
      { name: "description", content: "Team capacity, workload balance and per-member performance with AI rebalancing suggestions." },
      { property: "og:title", content: "Team & Workload — NexusFlow" },
      { property: "og:description", content: "Team capacity and workload balance with AI rebalancing." },
    ],
  }),
  component: TeamPage,
});

const presenceColor = {
  online: "oklch(0.75 0.16 160)",
  away: "oklch(0.8 0.15 85)",
  offline: "oklch(0.55 0.02 265)",
} as const;

function loadColor(w: number) {
  if (w >= 90) return "oklch(0.7 0.21 18)";
  if (w >= 75) return "oklch(0.8 0.15 85)";
  return "oklch(0.62 0.22 300)";
}

function TeamPage() {
  const [selected, setSelected] = useState(members[0]!.id);
  const member = members.find((m) => m.id === selected)!;
  const chartData = members.map((m) => ({ name: m.initials, workload: m.workload }));

  return (
    <PageShellMotion>
      <PageHeader
        title="Team"
        subtitle="Capacity, workload balance and delivery performance."
        right={
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-ai)" }}
          >
            <UserPlus className="size-3.5" /> Invite Member
          </motion.button>
        }
      />

      <motion.div variants={fadeUp} className="mb-5">
        <AIInsightCard
          title="Workload rebalancing"
          body="Priya is at 94% capacity while Arjun sits at 51%. Moving 2 design QA tasks would cut delivery risk on Website Redesign by ~18%."
          actions={["Balance Workload", "Suggest Reassignments", "Forecast capacity"]}
        />
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
            {members.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setSelected(m.id)}
                whileHover={{ y: -3 }}
                className={cn(
                  "rounded-xl border bg-card p-5 text-left transition-colors",
                  selected === m.id
                    ? "border-[oklch(0.6_0.2_272_/_0.55)] shadow-[0_20px_50px_-28px_oklch(0.6_0.2_272)]"
                    : "border-border/70 hover:border-[oklch(0.6_0.2_272_/_0.35)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="relative">
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                      style={{ background: m.color }}
                    >
                      {m.initials}
                    </span>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card"
                      style={{ background: presenceColor[m.presence] }}
                    />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.role}</p>
                  </div>
                  <span className="ml-auto text-right">
                    <span className="block text-sm font-semibold" style={{ color: loadColor(m.workload) }}>
                      {m.workload}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">capacity</span>
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={m.workload} />
                </div>
                <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
                  <span>{m.activeTasks} active</span>
                  <span>{m.completedTasks} completed</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Workload distribution" />
              <div className="h-[240px] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 265)" vertical={false} />
                    <XAxis dataKey="name" stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.62 0.03 265)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(0.6 0.2 272 / 0.08)" }}
                      contentStyle={{
                        background: "oklch(0.2 0.03 266)",
                        border: "1px solid oklch(0.32 0.04 266)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="workload" radius={[6, 6, 0, 0]}>
                      {chartData.map((d) => (
                        <Cell key={d.name} fill={loadColor(d.workload)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </motion.div>
        </div>

        <div className="space-y-5">
          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Member profile" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-12 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                    style={{ background: member.color }}
                  >
                    {member.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Mail className="size-3.5" /> {member.email}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["Active", member.activeTasks],
                    ["Completed", member.completedTasks],
                    ["Capacity", member.workload + "%"],
                    ["Presence", member.presence],
                  ].map(([k, v]) => (
                    <div key={k as string} className="rounded-lg border border-border/70 bg-surface-2/50 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</p>
                      <p className="mt-1 text-sm font-semibold capitalize">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Panel>
              <SectionTitle title="Team activity" />
              <div className="space-y-3 p-5">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3 text-[12px]">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[oklch(0.62_0.22_300)]" />
                    <p className="text-muted-foreground">
                      <span className="text-foreground">{a.who}</span> {a.what}{" "}
                      <span className="text-foreground">{a.target}</span> · {a.time}
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
