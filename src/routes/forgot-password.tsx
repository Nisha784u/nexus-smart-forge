import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthVisual, AuthPanel, Field, PrimaryButton } from "@/components/nexus/auth-parts";

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
        <Field label="Email address" type="email" placeholder="john@company.com" />
        <PrimaryButton to="/">Send reset link</PrimaryButton>
      </AuthPanel>
    </div>
  );
}
