import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthVisual, AuthPanel, AuthMessage, Field, PrimaryButton } from "@/components/nexus/auth-parts";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      void navigate({ to: "/app/dashboard", replace: true });
      return;
    }
    setSent(true);
  };

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
        {sent ? (
          <div className="space-y-4">
            <AuthMessage tone="success">
              Confirmation email sent to {email}. Confirm your email address, then sign in to enter your workspace.
              Signing up does not sign you in automatically.
            </AuthMessage>
            <Link
              to="/"
              className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-surface text-sm font-medium transition-colors hover:border-[oklch(0.6_0.2_272_/_0.45)]"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <AuthMessage>{error}</AuthMessage>
            <Field label="Name" placeholder="Nisha" autoComplete="name" value={name} onChange={setName} required />
            <Field label="Work email" type="email" placeholder="nisha@company.com" autoComplete="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" value={password} onChange={setPassword} required />
            <PrimaryButton disabled={busy}>{busy ? "Creating account…" : "Create account"}</PrimaryButton>
          </form>
        )}

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to the NexusFlow Terms of Service and Privacy Policy.
        </p>
      </AuthPanel>
    </div>
  );
}
