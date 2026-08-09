import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Users,
  Sparkles,
  Settings,
  Plus,
  Wand2,
  LineChart,
  Columns3,
} from "lucide-react";
import { useNexus } from "@/lib/nexus-store";
import { projects } from "@/lib/nexus-data";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; group: string; icon: typeof Search; to?: string; action?: () => void };

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, tasks, addTask } = useNexus();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: "c1", label: "Create Task", group: "Actions", icon: Plus, action: () => addTask({ title: "Untitled task" }) },
      { id: "c2", label: "Ask Nexus AI", group: "Actions", icon: Sparkles, to: "/app/assistant" },
      { id: "c3", label: "Generate tasks with AI", group: "Actions", icon: Wand2, to: "/app/generator" },
      { id: "c4", label: "Open Dashboard", group: "Navigation", icon: LayoutDashboard, to: "/app/dashboard" },
      { id: "c5", label: "Open Projects", group: "Navigation", icon: FolderKanban, to: "/app/projects" },
      { id: "c6", label: "Open Kanban Board", group: "Navigation", icon: Columns3, to: "/app/board" },
      { id: "c7", label: "Open Calendar", group: "Navigation", icon: CalendarDays, to: "/app/calendar" },
      { id: "c8", label: "Open Team", group: "Navigation", icon: Users, to: "/app/team" },
      { id: "c9", label: "Project Insights", group: "Navigation", icon: LineChart, to: "/app/insights" },
      { id: "c10", label: "Open Settings", group: "Navigation", icon: Settings, to: "/app/settings" },
    ];
    const projectItems: Item[] = projects.map((p) => ({
      id: "p-" + p.id,
      label: p.name,
      group: "Projects",
      icon: FolderKanban,
      to: `/app/projects/${p.id}`,
    }));
    const taskItems: Item[] = tasks.slice(0, 8).map((t) => ({
      id: "t-" + t.id,
      label: t.title,
      group: "Tasks",
      icon: CheckSquare,
      to: `/app/tasks/${t.id}`,
    }));
    return [...nav, ...projectItems, ...taskItems];
  }, [tasks, addTask]);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const groups = Array.from(new Set(filtered.map((i) => i.group)));

  const run = (item: Item) => {
    setPaletteOpen(false);
    setQuery("");
    item.action?.();
    if (item.to) void navigate({ to: item.to });
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[oklch(0.1_0.02_265_/_0.7)] p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-[oklch(0.6_0.2_272_/_0.35)] bg-popover shadow-[0_40px_120px_-40px_oklch(0.6_0.2_272_/_0.6)]"
          >
            <div className="flex items-center gap-3 border-b border-border/70 px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIndex((i) => Math.min(i + 1, filtered.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIndex((i) => Math.max(i - 1, 0));
                  }
                  if (e.key === "Enter") {
                    const item = filtered[index];
                    if (item) run(item);
                  }
                  if (e.key === "Escape") setPaletteOpen(false);
                }}
                placeholder="Search anything…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">esc</kbd>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{query}”</p>
              )}
              {groups.map((g) => (
                <div key={g} className="mb-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {g}
                  </p>
                  {filtered
                    .filter((i) => i.group === g)
                    .map((item) => {
                      const active = filtered.indexOf(item) === index;
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setIndex(filtered.indexOf(item))}
                          onClick={() => run(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            active ? "bg-[oklch(0.6_0.2_272_/_0.16)] text-foreground" : "text-muted-foreground",
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                          <span className="ml-auto text-[10px] text-muted-foreground/70">{item.group}</span>
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
