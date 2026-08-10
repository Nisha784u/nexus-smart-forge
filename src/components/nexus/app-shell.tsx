import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Users,
  Sparkles,
  Bell,
  Settings,
  Search,
  Plus,
  ChevronDown,
  Columns3,
  Wand2,
  LineChart,
  Menu,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useNexus } from "@/lib/nexus-store";
import { NexusOrb } from "./nexus-orb";
import { CommandPalette } from "./command-palette";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/board", label: "Kanban Board", icon: Columns3 },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/team", label: "Team", icon: Users },
] as const;

const aiNav = [
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/generator", label: "Task Generator", icon: Wand2 },
  { to: "/app/insights", label: "Project Insights", icon: LineChart },
] as const;

const systemNav = [
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof Bell; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-lg border border-[oklch(0.6_0.2_272_/_0.35)] bg-[oklch(0.6_0.2_272_/_0.12)]"
        />
      )}
      <Icon className={cn("relative size-4", active && "text-[oklch(0.78_0.13_250)]")} />
      <span className="relative">{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notifications, setPaletteOpen } = useNexus();
  const unread = notifications.filter((n) => n.unread).length;
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen]);

  useEffect(() => setMobileNav(false), [pathname]);

  const sidebar = (
    <div className="flex h-full w-[248px] shrink-0 flex-col border-r border-border/70 bg-[oklch(0.175_0.026_266)]">
      <Link to="/app/dashboard" className="flex items-center gap-3 px-5 py-5">
        <NexusOrb size={26} />
        <span className="font-display text-[15px] font-semibold tracking-tight">NexusFlow</span>
      </Link>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} active={pathname === n.to} />
          ))}
        </div>
        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Nexus AI
          </p>
          {aiNav.map((n) => (
            <NavItem key={n.to} {...n} active={pathname === n.to} />
          ))}
        </div>
        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Workspace
          </p>
          {systemNav.map((n) => (
            <NavItem key={n.to} {...n} active={pathname === n.to} />
          ))}
        </div>
      </nav>
      <div className="m-3 rounded-xl border border-border/70 bg-surface-2/60 p-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <NexusOrb size={16} /> AI credits
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
          <motion.div
            className="h-full"
            style={{ background: "var(--gradient-ai)" }}
            initial={{ width: 0 }}
            animate={{ width: "64%" }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">6,400 of 10,000 used this month</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">{sidebar}</div>
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex bg-background/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNav(false)}
          >
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full"
            >
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/70 bg-[oklch(0.16_0.028_265_/_0.85)] px-4 backdrop-blur-xl lg:px-8">
          <button
            className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
          <button className="hidden items-center gap-2 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:border-[oklch(0.6_0.2_272_/_0.4)] md:flex">
            <span className="size-4 rounded bg-[var(--gradient-ai)]" />
            Acme Workspace
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="group flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-border/70 bg-surface px-3 text-left text-xs text-muted-foreground transition-colors hover:border-[oklch(0.6_0.2_272_/_0.4)]"
          >
            <Search className="size-3.5" />
            Search projects, tasks, people…
            <kbd className="ml-auto rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground sm:flex"
              style={{ background: "var(--gradient-ai)" }}
            >
              <Plus className="size-3.5" /> Create
            </motion.button>
            <Link
              to="/app/notifications"
              className="relative rounded-lg border border-border/70 bg-surface p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.65_0.2_20)] text-[9px] font-bold text-background"
                >
                  {unread}
                </motion.span>
              )}
            </Link>
            <Link to="/app/settings" className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface p-1 pr-2.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-[var(--gradient-ai)] text-[10px] font-bold text-background">
                N
              </span>
              <span className="hidden text-xs font-medium sm:block">Nisha</span>
            </Link>
          </div>
        </header>
        <main className="grid-noise min-w-0 flex-1">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
