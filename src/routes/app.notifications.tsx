import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { AtSign, Bell, CalendarClock, CheckCircle2, FolderKanban, MessageSquare, Sparkles } from "lucide-react";
import { PageHeader, PageShellMotion, Panel, fadeUp } from "@/components/nexus/ui-bits";
import type { Notification } from "@/lib/nexus-data";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — NexusFlow" },
      { name: "description", content: "Every mention, deadline, AI recommendation and project update in one filterable feed." },
      { property: "og:title", content: "Notifications — NexusFlow" },
      { property: "og:description", content: "Mentions, deadlines and AI recommendations in one feed." },
    ],
  }),
  component: NotificationsPage,
});

const icons: Record<Notification["type"], typeof Bell> = {
  assigned: Bell,
  completed: CheckCircle2,
  comment: MessageSquare,
  deadline: CalendarClock,
  ai: Sparkles,
  project: FolderKanban,
};

const filters = ["All", "Unread", "Mentions", "AI"] as const;

function NotificationsPage() {
  const { notifications, markAllRead, toggleRead } = useNexus();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = notifications.filter((n) =>
    filter === "Unread" ? n.unread : filter === "Mentions" ? n.mention : filter === "AI" ? n.type === "ai" : true,
  );

  return (
    <PageShellMotion className="max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Mentions, deadlines and AI recommendations."
        right={
          <button
            onClick={markAllRead}
            className="rounded-lg border border-border/70 bg-surface px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Mark all as read
          </button>
        }
      />

      <motion.div variants={fadeUp} className="mb-4 flex gap-1 rounded-lg border border-border/70 bg-surface p-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "relative flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {filter === f && (
              <motion.span layoutId="notif-tab" className="absolute inset-0 rounded-md bg-[oklch(0.6_0.2_272_/_0.18)]" />
            )}
            <span className="relative">{f}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Panel>
          <div className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {list.map((n) => {
                const Icon = icons[n.type];
                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => toggleRead(n.id)}
                    className={cn(
                      "flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2/40",
                      n.unread && "bg-[oklch(0.6_0.2_272_/_0.05)]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        n.type === "ai" ? "bg-[oklch(0.62_0.22_300_/_0.16)]" : "bg-surface-2",
                      )}
                    >
                      <Icon className={cn("size-4", n.type === "ai" ? "text-[oklch(0.78_0.14_300)]" : "text-muted-foreground")} />
                    </span>
                    <div className="flex-1">
                      <p className="flex items-center gap-2 text-[13px] font-medium">
                        {n.title}
                        {n.mention && <AtSign className="size-3 text-[oklch(0.72_0.16_280)]" />}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{n.body}</p>
                      <p className="mt-1.5 text-[10px] text-muted-foreground">{n.time}</p>
                    </div>
                    {n.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-[oklch(0.62_0.22_300)]" />}
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {list.length === 0 && (
              <p className="px-5 py-16 text-center text-xs text-muted-foreground">You're all caught up.</p>
            )}
          </div>
        </Panel>
      </motion.div>
    </PageShellMotion>
  );
}
