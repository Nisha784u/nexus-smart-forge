import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { NexusOrb } from "@/components/nexus/nexus-orb";

const nodes = [
  { x: 18, y: 22, label: "Mobile App", pct: "72%" },
  { x: 70, y: 16, label: "Website Redesign", pct: "48%" },
  { x: 76, y: 62, label: "Marketing", pct: "25%" },
  { x: 16, y: 68, label: "Nexus AI", pct: "90%" },
  { x: 44, y: 84, label: "Design System", pct: "61%" },
];

export function AuthVisual() {
  return (
    <div className="relative hidden overflow-hidden border-r border-border/60 bg-[oklch(0.145_0.03_266)] lg:flex lg:w-[55%]">
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/4 size-[520px] rounded-full blur-[120px]"
        style={{ background: "var(--gradient-ai)", opacity: 0.22 }}
        animate={{ opacity: [0.14, 0.26, 0.14], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex w-full flex-col justify-between p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <NexusOrb size={28} />
          <span className="font-display text-[15px] font-semibold tracking-tight">NexusFlow</span>
        </motion.div>

        <div className="relative my-8 h-[380px] w-full">
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {nodes.map((n, i) => (
              <motion.line
                key={i}
                x1="47"
                y1="50"
                x2={n.x + 3}
                y2={n.y + 5}
                stroke="oklch(0.6 0.2 272 / 0.45)"
                strokeWidth="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 + i * 0.12 }}
              />
            ))}
            {nodes.map((n, i) => (
              <motion.circle
                key={"d" + i}
                r="0.7"
                fill="oklch(0.85 0.12 220)"
                animate={{ cx: [47, n.x + 3, 47], cy: [50, n.y + 5, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
              />
            ))}
          </svg>

          <div className="absolute left-[43%] top-[42%]">
            <NexusOrb size={92} />
          </div>

          {nodes.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className="absolute"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                className="w-[168px] rounded-lg border border-border/70 bg-[oklch(0.21_0.03_266_/_0.9)] p-3 shadow-[0_20px_50px_-30px_oklch(0_0_0)] backdrop-blur"
              >
                <p className="text-[11px] font-medium">{n.label}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full"
                    style={{ background: "var(--gradient-ai)" }}
                    initial={{ width: 0 }}
                    animate={{ width: n.pct }}
                    transition={{ duration: 1.2, delay: 0.8 + i * 0.12 }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{n.pct} complete</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-lg"
        >
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Plan smarter. <span className="ai-gradient-text">Build faster.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            AI-powered project management that turns your team&apos;s work into intelligent action.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function AuthPanel({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <motion.div
        className="pointer-events-none absolute right-[-10%] top-[-10%] size-[420px] rounded-full blur-[120px]"
        style={{ background: "var(--gradient-ai)", opacity: 0.12 }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative w-full max-w-[400px]"
      >
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <NexusOrb size={26} />
          <span className="font-display text-[15px] font-semibold">NexusFlow</span>
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-7 space-y-4">{children}</div>
        {footer && <div className="mt-7 text-center text-sm text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-foreground/80">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-[oklch(0.6_0.2_272_/_0.6)] focus:shadow-[0_0_0_3px_oklch(0.6_0.2_272_/_0.15)]"
      />
    </label>
  );
}

export function PrimaryButton({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="block">
      <motion.span
        whileHover={{ y: -1, filter: "brightness(1.12)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
        className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.6_0.2_272)]"
        style={{ background: "var(--gradient-ai)" }}
      >
        {children}
      </motion.span>
    </Link>
  );
}
