import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function NexusOrb({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }} aria-hidden>
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: "var(--gradient-ai)", opacity: 0.55 }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, oklch(0.68 0.17 249), oklch(0.6 0.2 272), oklch(0.62 0.22 300), oklch(0.79 0.13 200), oklch(0.68 0.17 249))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.14,
          background:
            "radial-gradient(circle at 32% 28%, oklch(0.95 0.03 250 / 0.9), oklch(0.5 0.18 268 / 0.65) 45%, oklch(0.18 0.03 266) 78%)",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full border"
        style={{ inset: size * 0.04, borderColor: "oklch(0.85 0.06 250 / 0.35)" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute left-1/2 top-0 block rounded-full"
          style={{
            width: Math.max(3, size * 0.06),
            height: Math.max(3, size * 0.06),
            marginLeft: -Math.max(3, size * 0.06) / 2,
            background: "oklch(0.9 0.1 220)",
            boxShadow: "0 0 10px oklch(0.8 0.15 240)",
          }}
        />
      </motion.div>
    </div>
  );
}

export function AIBadge({ label = "Nexus AI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.6_0.2_272_/_0.4)] bg-[oklch(0.6_0.2_272_/_0.12)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-foreground/90">
      <NexusOrb size={12} />
      {label}
    </span>
  );
}
