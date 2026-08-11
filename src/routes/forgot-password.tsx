import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthVisual, AuthPanel, AuthMessage, Field, PrimaryButton } from "@/components/nexus/auth-parts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your NexusFlow password" },
      { name: "description", content: "Request a secure reset link for your NexusFlow workspace account." },
      { property: "og:title", content: "Reset your NexusFlow password" },
      { property: "og:description", content: "Request a secure reset link for your NexusFlow account." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisual />
      <AuthPanel
        title="Forgot password?"
        subtitle="Enter your email and we'll send a link to reset your password."
        footer={
          <Link to="/" className="font-medium text-[oklch(0.78_0.13_250)] hover:underline">
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <AuthMessage>{error}</AuthMessage>
          {sent && <AuthMessage tone="success">If that address has an account, a reset link is on its way.</AuthMessage>}
          <Field label="Email address" type="email" placeholder="nisha@company.com" autoComplete="email" value={email} onChange={setEmail} required />
          <PrimaryButton disabled={busy}>{busy ? "Sending…" : "Send reset link"}</PrimaryButton>
        </form>
      </AuthPanel>
    </div>
  );
}
