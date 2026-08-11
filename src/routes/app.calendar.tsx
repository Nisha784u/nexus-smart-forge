import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  AIInsightCard,
  Panel,
  PageHeader,
  PageShellMotion,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { toIsoDate, type CalendarEvent } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — NexusFlow" },
      { name: "description", content: "Deadlines, meetings and milestones in month, week and day views with AI schedule optimisation." },
      { property: "og:title", content: "Calendar — NexusFlow" },
      { property: "og:description", content: "Deadlines, meetings and milestones with AI schedule optimisation." },
    ],
  }),
  component: CalendarPage,
});

const kindStyles: Record<CalendarEvent["kind"], string> = {
  deadline: "border-[oklch(0.7_0.21_18_/_0.4)] bg-[oklch(0.7_0.21_18_/_0.14)] text-[oklch(0.8_0.14_25)]",
  meeting: "border-[oklch(0.68_0.17_249_/_0.4)] bg-[oklch(0.68_0.17_249_/_0.14)] text-[oklch(0.82_0.11_240)]",
  milestone: "border-[oklch(0.62_0.22_300_/_0.4)] bg-[oklch(0.62_0.22_300_/_0.14)] text-[oklch(0.82_0.12_300)]",
  event: "border-[oklch(0.75_0.16_160_/_0.4)] bg-[oklch(0.75_0.16_160_/_0.14)] text-[oklch(0.85_0.12_160)]",
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarPage() {
  const [view, setView] = useState<"Month" | "Week" | "Day">("Month");
  const { events, moveEvent, addEvent: createEvent, updateEvent, deleteEvent } = useNexus();
  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const days = Array.from({ length: 35 }, (_, i) => i - 2);

  const dateForDay = (day: number) => {
    const now = new Date();
    return toIsoDate(new Date(now.getFullYear(), now.getMonth(), day));
  };

  const move = (id: string, day: number) => void moveEvent(id, dateForDay(day));

  const addEvent = (day: number) => {
    void createEvent({ title: "New event", date: dateForDay(day), kind: "event", time: "12:00" });
  };

  return (
    <PageShellMotion>
      <PageHeader
        title="Calendar"
        subtitle="Deadlines, meetings and milestones across every project."
        right={
          <div className="flex items-center gap-2.5">
            <div className="flex rounded-lg border border-border/70 bg-surface p-0.5">
              {(["Month", "Week", "Day"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    view === v ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {view === v && (
                    <motion.span layoutId="cal-view" className="absolute inset-0 rounded-md bg-[oklch(0.6_0.2_272_/_0.18)]" />
                  )}
                  <span className="relative">{v}</span>
                </button>
              ))}
            </div>
            <button className="rounded-lg border border-border/70 bg-surface p-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-sm font-medium">May 2026</span>
            <button className="rounded-lg border border-border/70 bg-surface p-2 text-muted-foreground hover:text-foreground">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        }
      />

      <motion.div variants={fadeUp} className="mb-5">
        <AIInsightCard
          title="Optimize My Schedule"
          body="Thursday is overloaded with 6 hours of deep work and 3 meetings. Nexus AI can shift 2 low-priority items to Friday morning."
          actions={["Optimize My Schedule", "Protect focus time"]}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Panel className="overflow-hidden">
          {view === "Month" ? (
            <>
              <div className="grid grid-cols-7 border-b border-border/70">
                {weekdays.map((d) => (
                  <div key={d} className="px-3 py-2.5 text-[11px] font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((d) => {
                  const valid = d >= 1 && d <= 31;
                  const dayEvents = events.filter((e) => e.day === d);
                  return (
                    <div
                      key={d}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragId && valid) move(dragId, d);
                        setDragId(null);
                      }}
                      onDoubleClick={() => valid && addEvent(d)}
                      className={cn(
                        "group min-h-[112px] border-b border-r border-border/50 p-2",
                        !valid && "bg-surface/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[11px]", valid ? "text-muted-foreground" : "text-muted-foreground/40")}>
                          {valid ? d : ""}
                        </span>
                        {valid && (
                          <button
                            onClick={() => addEvent(d)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Add event"
                          >
                            <Plus className="size-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {dayEvents.map((e) => (
                          <motion.button
                            key={e.id}
                            layout
                            layoutId={"cal-" + e.id}
                            draggable
                            onDragStart={() => setDragId(e.id)}
                            onClick={() => setSelected(e)}
                            whileHover={{ y: -1 }}
                            className={cn(
                              "block w-full cursor-grab truncate rounded-md border px-1.5 py-1 text-left text-[10px]",
                              kindStyles[e.kind],
                            )}
                          >
                            {e.time} · {e.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="divide-y divide-border/60">
              {(view === "Week" ? weekdays : ["Today"]).map((label, di) => (
                <div key={label} className="flex gap-4 p-4">
                  <span className="w-16 text-[11px] font-medium text-muted-foreground">{label}</span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    {events
                      .filter((_, i) => (view === "Day" ? i < 4 : i % 7 === di % 7))
                      .map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelected(e)}
                          className={cn("rounded-md border px-2 py-1 text-[11px]", kindStyles[e.kind])}
                        >
                          {e.time} · {e.title}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.1_0.02_265_/_0.7)] p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-border bg-popover p-6"
            >
              <h3 className="text-sm font-semibold">Edit event</h3>
              <input
                value={selected.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setSelected({ ...selected, title });
                  void updateEvent(selected.id, { title });
                }}
                className="mt-4 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
              />
              <p className="mt-3 text-[11px] text-muted-foreground">
                May {selected.day} · {selected.time} · {selected.kind}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    void deleteEvent(selected.id);
                    setSelected(null);
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-ai)" }}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShellMotion>
  );
}
