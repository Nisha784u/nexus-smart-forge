import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AuthVisual, AuthPanel, Field, PrimaryButton } from "@/components/nexus/auth-parts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusFlow — AI-powered project management" },
      {
        name: "description",
        content:
          "NexusFlow turns your team's projects, tasks and boards into intelligent action with AI woven through every workflow.",
      },
      { property: "og:title", content: "NexusFlow — AI-powered project management" },
      {
        property: "og:description",
        content: "Plan smarter. Build faster. AI-powered project management for modern product teams.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthVisual />
      <AuthPanel
        title="Welcome back"
        subtitle="Sign in to your NexusFlow workspace."
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-medium text-[oklch(0.78_0.13_250)] hover:underline">
              Create one
            </Link>
          </>
        }
      >
        <Field label="Email address" type="email" placeholder="nisha@company.com" autoComplete="email" />
        <Field label="Password" type="password" placeholder="••••••••" autoComplete="current-password" />
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="size-3.5 accent-[oklch(0.6_0.2_272)]" defaultChecked />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[oklch(0.78_0.13_250)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <PrimaryButton to="/app/dashboard">Sign In</PrimaryButton>
        <div className="flex items-center gap-3 py-1 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface text-sm font-medium transition-colors hover:border-[oklch(0.6_0.2_272_/_0.45)]"
        >
          <svg viewBox="0 0 24 24" className="size-4">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
          Continue with Google
        </motion.button>
      </AuthPanel>
    </div>
  );
}
