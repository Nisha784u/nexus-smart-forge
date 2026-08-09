import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/nexus/app-shell";
import { NexusProvider } from "@/lib/nexus-store";

export const Route = createFileRoute("/app")({
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
