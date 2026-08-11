import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Grid2x2, List, Plus, Search } from "lucide-react";
import {
  AvatarStack,
  Panel,
  PageHeader,
  PageShellMotion,
  ProgressBar,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { NexusOrb } from "@/components/nexus/nexus-orb";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — NexusFlow" },
      { name: "description", content: "Browse every project workspace with progress, owners, health and AI status." },
      { property: "og:title", content: "Projects — NexusFlow" },
      { property: "og:description", content: "Browse every project workspace with progress, owners and AI status." },
    ],
  }),
  component: ProjectsPage,
});

const statusCopy = {
  "on-track": { label: "On track", cls: "text-[oklch(0.75_0.16_160)] border-[oklch(0.75_0.16_160_/_0.3)]" },
  "at-risk": { label: "At risk", cls: "text-[oklch(0.8_0.15_78)] border-[oklch(0.8_0.15_78_/_0.35)]" },
  planning: { label: "Planning", cls: "text-[oklch(0.79_0.13_200)] border-[oklch(0.79_0.13_200_/_0.3)]" },
  completed: { label: "Completed", cls: "text-muted-foreground border-border" },
} as const;

function ProjectsPage() {
  const { projects, loading } = useNexus();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("progress");
  const [view, setView] = useState<"grid" | "list">("grid");

  const list = useMemo(() => {
    const f = projects.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) =>
      sort === "progress" ? b.progress - a.progress : sort === "name" ? a.name.localeCompare(b.name) : b.health - a.health,
    );
  }, [projects, q, sort]);

  return (
    <PageShellMotion>
      <PageHeader
        title="Projects"
        subtitle="Four active workstreams, continuously analysed by Nexus AI."
        right={
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-ai)" }}
          >
            <Plus className="size-3.5" /> New Project
          </motion.button>
        }
      />

      <motion.div variants={fadeUp} className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="h-9 w-full rounded-lg border border-border/70 bg-surface pl-9 pr-3 text-xs outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
          />
        </div>
        <select
          aria-label="Sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs outline-none"
        >
          <option value="progress" className="bg-popover">Sort: Progress</option>
          <option value="name" className="bg-popover">Sort: Name</option>
          <option value="health" className="bg-popover">Sort: Health</option>
        </select>
        <div className="flex rounded-lg border border-border/70 bg-surface p-0.5">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={v}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === v ? "bg-[oklch(0.6_0.2_272_/_0.2)] text-foreground" : "text-muted-foreground",
              )}
            >
              {v === "grid" ? <Grid2x2 className="size-3.5" /> : <List className="size-3.5" />}
            </button>
          ))}
        </div>
      </motion.div>

      <div className={cn(view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3")}>
        {list.map((p) => (
          <motion.div key={p.id} variants={fadeUp}>
            <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className="block">
              <Panel hover className={cn("p-5", view === "list" && "flex items-center gap-6")}>
                <div className={cn(view === "list" && "min-w-0 flex-1")}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-[15px] font-semibold">{p.name}</h3>
                    {p.aiActive && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.6_0.2_272_/_0.4)] bg-[oklch(0.6_0.2_272_/_0.12)] px-2 py-0.5 text-[10px]">
                        <NexusOrb size={10} /> Nexus AI Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
                <div className={cn("mt-4", view === "list" && "mt-0 w-[280px]")}>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{p.progress}% complete</span>
                    <span>
                      {p.tasksDone}/{p.tasksTotal} tasks
                    </span>
                  </div>
                  <ProgressBar value={p.progress} className="mt-2" />
                </div>
                <div className={cn("mt-4 flex items-center justify-between", view === "list" && "mt-0 w-[240px]")}>
                  <AvatarStack ids={p.memberIds} size={24} />
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px]", statusCopy[p.status].cls)}>
                      {statusCopy[p.status].label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Due {p.due}</span>
                  </div>
                </div>
              </Panel>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageShellMotion>
  );
}
