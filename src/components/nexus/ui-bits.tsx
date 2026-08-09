import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { memberById, type Priority, type Status } from "@/lib/nexus-data";
import { NexusOrb } from "./nexus-orb";

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export function PageShellMotion({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className={cn("mx-auto w-full max-w-[1500px] px-8 py-7", className)}
    >
      {children}
    </motion.div>
  );
}

export function Panel({
  children,
  className,
  hover,
  ...rest
}: { children: ReactNode; className?: string; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "panel relative",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-[oklch(0.6_0.2_272_/_0.45)] hover:shadow-[0_18px_50px_-24px_oklch(0.6_0.2_272_/_0.7)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-3.5">
      <h3 className="text-[13px] font-semibold tracking-wide text-foreground/90 uppercase">{title}</h3>
      {action}
    </div>
  );
}

export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  low: "text-[oklch(0.79_0.13_200)] border-[oklch(0.79_0.13_200_/_0.3)] bg-[oklch(0.79_0.13_200_/_0.1)]",
  medium: "text-[oklch(0.8_0.15_78)] border-[oklch(0.8_0.15_78_/_0.3)] bg-[oklch(0.8_0.15_78_/_0.1)]",
  high: "text-[oklch(0.72_0.19_35)] border-[oklch(0.72_0.19_35_/_0.35)] bg-[oklch(0.72_0.19_35_/_0.12)]",
  urgent: "text-[oklch(0.7_0.21_18)] border-[oklch(0.7_0.21_18_/_0.4)] bg-[oklch(0.7_0.21_18_/_0.14)]",
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
        priorityStyles[priority],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

const statusStyles: Record<Status, string> = {
  backlog: "text-muted-foreground border-border bg-surface-2",
  todo: "text-[oklch(0.79_0.13_200)] border-[oklch(0.79_0.13_200_/_0.3)] bg-[oklch(0.79_0.13_200_/_0.08)]",
  "in-progress": "text-[oklch(0.7_0.17_255)] border-[oklch(0.7_0.17_255_/_0.35)] bg-[oklch(0.7_0.17_255_/_0.1)]",
  review: "text-[oklch(0.68_0.2_300)] border-[oklch(0.68_0.2_300_/_0.35)] bg-[oklch(0.68_0.2_300_/_0.1)]",
  done: "text-[oklch(0.75_0.16_160)] border-[oklch(0.75_0.16_160_/_0.3)] bg-[oklch(0.75_0.16_160_/_0.1)]",
};

export function StatusPill({ status }: { status: Status }) {
  const label = { backlog: "Backlog", todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done" }[status];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", statusStyles[status])}>
      {label}
    </span>
  );
}

export function AvatarChip({ id, size = 26 }: { id: string; size?: number }) {
  const m = memberById(id);
  return (
    <span
      title={m.name}
      className="inline-flex items-center justify-center rounded-full border border-background text-[10px] font-semibold text-background"
      style={{ width: size, height: size, background: m.color }}
    >
      {m.initials}
    </span>
  );
}

export function AvatarStack({ ids, size = 26 }: { ids: string[]; size?: number }) {
  return (
    <div className="flex -space-x-2">
      {ids.slice(0, 4).map((id) => (
        <AvatarChip key={id} id={id} size={size} />
      ))}
      {ids.length > 4 && (
        <span
          className="inline-flex items-center justify-center rounded-full border border-background bg-surface-2 text-[10px] font-semibold text-muted-foreground"
          style={{ width: size, height: size }}
        >
          +{ids.length - 4}
        </span>
      )}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: "var(--gradient-ai)" }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function AIActions({ actions, onAction }: { actions: string[]; onAction?: (a: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <motion.button
          key={a}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction?.(a)}
          className="rounded-lg border border-[oklch(0.6_0.2_272_/_0.35)] bg-[oklch(0.6_0.2_272_/_0.08)] px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-[oklch(0.6_0.2_272_/_0.18)]"
        >
          {a}
        </motion.button>
      ))}
    </div>
  );
}

export function AIInsightCard({
  title = "Nexus AI Insight",
  body,
  actions,
  onAction,
  className,
}: {
  title?: string;
  body: ReactNode;
  actions?: string[];
  onAction?: (a: string) => void;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn("ai-border relative overflow-hidden rounded-xl bg-surface p-5", className)}
    >
      <motion.div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full blur-3xl"
        style={{ background: "var(--gradient-ai)", opacity: 0.16 }}
        animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-start gap-4">
        <NexusOrb size={42} />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">live</span>
          </div>
          <div className="text-sm leading-relaxed text-muted-foreground">{body}</div>
          {actions && <AIActions actions={actions} onAction={onAction} />}
        </div>
      </div>
    </motion.div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </motion.div>
  );
}
