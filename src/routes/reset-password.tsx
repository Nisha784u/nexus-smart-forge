import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthVisual, AuthPanel, AuthMessage, Field, PrimaryButton } from "@/components/nexus/auth-parts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new NexusFlow password" },
      { name: "description", content: "Set a new password for your NexusFlow workspace account." },
      { property: "og:title", content: "Choose a new NexusFlow password" },
      { property: "og:description", content: "Set a new password for your NexusFlow account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    void navigate({ to: "/app/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <AuthVisual />
      <AuthPanel
        title="Set a new password"
        subtitle="Choose a strong password for your workspace account."
        footer={
          <Link to="/" className="font-medium text-[oklch(0.78_0.13_250)] hover:underline">
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <AuthMessage>{error}</AuthMessage>
          {!ready && (
            <AuthMessage tone="success">
              Open this page from the reset link in your email to continue.
            </AuthMessage>
          )}
          <Field
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
          />
          <PrimaryButton disabled={busy || !ready}>{busy ? "Updating…" : "Update password"}</PrimaryButton>
        </form>
      </AuthPanel>
    </div>
  );
}
