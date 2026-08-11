import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/nexus/app-shell";
import { NexusProvider } from "@/lib/nexus-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  // Supabase keeps the session in localStorage, so the gate runs client-side only.
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <NexusProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </NexusProvider>
  );
}
