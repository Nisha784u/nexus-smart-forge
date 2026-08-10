import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { NexusOrb } from "@/components/nexus/nexus-orb";
import {
  Panel,
  PageHeader,
  PageShellMotion,
  PriorityPill,
  SectionTitle,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { projects, type Priority } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/generator")({
  head: () => ({
    meta: [
      { title: "AI Task Generator — NexusFlow" },
      { name: "description", content: "Describe a goal and let Nexus AI generate a structured, estimated and assigned task breakdown." },
      { property: "og:title", content: "AI Task Generator — NexusFlow" },
      { property: "og:description", content: "Turn a goal into a structured task breakdown with Nexus AI." },
    ],
  }),
  component: GeneratorPage,
});

type Generated = { id: string; title: string; priority: Priority; estimate: string; owner: string };

const generated: Generated[] = [
  { id: "g1", title: "Define checkout API contract", priority: "high", estimate: "5 pts", owner: "Rahul" },
  { id: "g2", title: "Build payment form UI states", priority: "medium", estimate: "3 pts", owner: "Priya" },
  { id: "g3", title: "Implement webhook verification", priority: "urgent", estimate: "8 pts", owner: "Rahul" },
  { id: "g4", title: "Add retry & backoff handling", priority: "high", estimate: "5 pts", owner: "Ananya" },
  { id: "g5", title: "Write reconciliation test suite", priority: "medium", estimate: "5 pts", owner: "Sneha" },
  { id: "g6", title: "Document rollout & rollback plan", priority: "low", estimate: "2 pts", owner: "Nisha" },
];

const templates = ["Product launch", "Sprint plan", "Bug triage", "Design handoff", "Migration"];

function GeneratorPage() {
  const { addTask } = useNexus();
  const [goal, setGoal] = useState("");
  const [project, setProject] = useState(projects[0]!.id);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [picked, setPicked] = useState<string[]>(generated.map((g) => g.id));
  const [added, setAdded] = useState(false);

  const run = () => {
    if (!goal.trim()) return;
    setPhase("loading");
    setAdded(false);
    window.setTimeout(() => setPhase("done"), 1500);
  };

  return (
    <PageShellMotion className="max-w-5xl">
      <PageHeader title="AI Task Generator" subtitle="Describe an outcome — Nexus AI writes the breakdown." />

      <motion.div variants={fadeUp}>
        <div className="ai-border rounded-xl bg-surface p-6">
          <div className="flex items-center gap-3">
            <NexusOrb size={34} />
            <div>
              <h2 className="text-sm font-semibold">What do you want to ship?</h2>
              <p className="text-[11px] text-muted-foreground">Nexus AI uses your project history to estimate and assign.</p>
            </div>
          </div>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={4}
            placeholder="e.g. Launch a Stripe checkout flow with webhooks, retries and reconciliation before the June release."
            className="mt-5 w-full resize-none rounded-lg border border-border/70 bg-card p-3.5 text-sm outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t}
                onClick={() => setGoal(`${t}: `)}
                className="rounded-full border border-border/70 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Target project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-9 rounded-lg border border-border/70 bg-card px-2.5 text-xs outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-popover">
                  {p.name}
                </option>
              ))}
            </select>
            <motion.button
              onClick={run}
              disabled={phase === "loading" || !goal.trim()}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
              style={{ background: "var(--gradient-ai)" }}
            >
              <Wand2 className="size-3.5" />
              {phase === "loading" ? "Generating…" : "Generate Tasks"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 space-y-2.5"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                className="h-14 rounded-lg border border-border/70 bg-surface"
              />
            ))}
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <Panel>
              <SectionTitle
                title={`${picked.length} tasks selected`}
                action={
                  <button
                    onClick={() => {
                      picked.forEach((id) => {
                        const g = generated.find((x) => x.id === id);
                        if (g) addTask({ title: g.title, priority: g.priority, projectId: project });
                      });
                      setAdded(true);
                    }}
                    className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                    style={{ background: "var(--gradient-ai)" }}
                  >
                    {added ? "Added to project ✓" : "Add to project"}
                  </button>
                }
              />
              <div className="divide-y divide-border/60">
                {generated.map((g, i) => {
                  const on = picked.includes(g.id);
                  return (
                    <motion.button
                      key={g.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id]))}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-2/40"
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded border",
                          on ? "border-transparent bg-[oklch(0.62_0.22_300)]" : "border-border",
                        )}
                      >
                        {on && <Check className="size-3 text-primary-foreground" />}
                      </span>
                      <span className="flex-1 text-sm">{g.title}</span>
                      <PriorityPill priority={g.priority} />
                      <span className="w-16 text-right text-[11px] text-muted-foreground">{g.estimate}</span>
                      <span className="w-32 text-right text-[11px] text-muted-foreground">{g.owner}</span>
                    </motion.button>
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 border-t border-border/60 px-5 py-3 text-[11px] text-muted-foreground">
                <Sparkles className="size-3" /> Estimates derived from 6 weeks of similar work in this workspace.
              </p>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShellMotion>
  );
}
