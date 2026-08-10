import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthVisual, AuthPanel, Field, PrimaryButton } from "@/components/nexus/auth-parts";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your NexusFlow account" },
      { name: "description", content: "Start planning smarter with NexusFlow — AI-powered project management for product teams." },
      { property: "og:title", content: "Create your NexusFlow account" },
      { property: "og:description", content: "Start planning smarter with NexusFlow — AI-powered project management." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <AuthVisual />
      <AuthPanel
        title="Create your workspace"
        subtitle="Two minutes to a smarter project workflow."
        footer={
          <>
            Already have an account?{" "}
            <Link to="/" className="font-medium text-[oklch(0.78_0.13_250)] hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <Field label="Name" placeholder="Nisha" />
        <Field label="Work email" type="email" placeholder="john@company.com" />
        <Field label="Password" type="password" placeholder="At least 8 characters" />
        <PrimaryButton to="/app/dashboard">Create account</PrimaryButton>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to the NexusFlow Terms of Service and Privacy Policy.
        </p>
      </AuthPanel>
    </div>
  );
}
