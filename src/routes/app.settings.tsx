import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  PageHeader,
  PageShellMotion,
  Panel,
  ProgressBar,
  SectionTitle,
  fadeUp,
} from "@/components/nexus/ui-bits";
import { useNexus } from "@/lib/nexus-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NexusFlow" },
      { name: "description", content: "Manage your profile, workspace, notifications, AI preferences and billing in NexusFlow." },
      { property: "og:title", content: "Settings — NexusFlow" },
      { property: "og:description", content: "Profile, workspace, notifications, AI preferences and billing." },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["Profile", "Workspace", "Notifications", "AI", "Billing"] as const;
type Tab = (typeof tabs)[number];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-5 w-9 items-center rounded-full px-0.5 transition-colors",
        on ? "bg-[oklch(0.62_0.22_300)]" : "bg-surface-2",
      )}
      role="switch"
      aria-checked={on}
    >
      <motion.span layout className="size-4 rounded-full bg-foreground" style={{ marginLeft: on ? "auto" : 0 }} />
    </button>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input
        defaultValue={defaultValue}
        className="mt-1.5 h-10 w-full rounded-lg border border-border/70 bg-surface px-3 text-sm outline-none focus:border-[oklch(0.6_0.2_272_/_0.6)]"
      />
    </label>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border/60 py-4 last:border-0">
      <div>
        <p className="text-[13px] font-medium">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { members, currentMember } = useNexus();
  const [tab, setTab] = useState<Tab>("Profile");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    email: true,
    push: false,
    mentions: true,
    digest: true,
    autoPrioritize: true,
    autoAssign: false,
    riskAlerts: true,
  });
  const flip = (k: string) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <PageShellMotion className="max-w-5xl">
      <PageHeader title="Settings" subtitle="Workspace, profile and AI preferences." />

      <div className="grid gap-5 md:grid-cols-[190px_1fr]">
        <motion.nav variants={fadeUp} className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative block w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === t && (
                <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-lg bg-[oklch(0.6_0.2_272_/_0.16)]" />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </motion.nav>

        <motion.div variants={fadeUp} key={tab}>
          <Panel>
            <SectionTitle title={tab} />
            <div className="p-5">
              {tab === "Profile" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="flex size-14 items-center justify-center rounded-full text-base font-semibold text-primary-foreground"
                      style={{ background: currentMember?.color ?? "var(--electric)" }}
                    >
                      {currentMember?.initials ?? "?"}
                    </span>
                    <button className="rounded-lg border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                      Change avatar
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" defaultValue={currentMember?.name ?? ""} />
                    <Field label="Email" defaultValue={currentMember?.email ?? ""} />
                    <Field label="Role" defaultValue={currentMember?.role ?? ""} />
                    <Field label="Timezone" defaultValue="UTC+01:00" />
                  </div>
                </div>
              )}

              {tab === "Workspace" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Workspace name" defaultValue="Acme Product" />
                    <Field label="Workspace URL" defaultValue="acme.nexusflow.io" />
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] text-muted-foreground">Members</p>
                    <div className="rounded-lg border border-border/70">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 last:border-0">
                          <span
                            className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-primary-foreground"
                            style={{ background: m.color }}
                          >
                            {m.initials}
                          </span>
                          <span className="text-[13px]">{m.name}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "Notifications" && (
                <div>
                  <Row title="Email notifications" desc="Daily summaries of assignments and deadlines.">
                    <Toggle on={!!toggles["email"]} onClick={() => flip("email")} />
                  </Row>
                  <Row title="Push notifications" desc="Realtime alerts in your browser.">
                    <Toggle on={!!toggles["push"]} onClick={() => flip("push")} />
                  </Row>
                  <Row title="Mentions only" desc="Notify me only when I'm mentioned.">
                    <Toggle on={!!toggles["mentions"]} onClick={() => flip("mentions")} />
                  </Row>
                  <Row title="Weekly digest" desc="Monday morning progress report.">
                    <Toggle on={!!toggles["digest"]} onClick={() => flip("digest")} />
                  </Row>
                </div>
              )}

              {tab === "AI" && (
                <div>
                  <Row title="Auto-prioritize tasks" desc="Let Nexus AI reorder your backlog daily.">
                    <Toggle on={!!toggles["autoPrioritize"]} onClick={() => flip("autoPrioritize")} />
                  </Row>
                  <Row title="Auto-assign new tasks" desc="Assign based on capacity and expertise.">
                    <Toggle on={!!toggles["autoAssign"]} onClick={() => flip("autoAssign")} />
                  </Row>
                  <Row title="Risk alerts" desc="Warn me when a project trends off-track.">
                    <Toggle on={!!toggles["riskAlerts"]} onClick={() => flip("riskAlerts")} />
                  </Row>
                  <div className="mt-5 rounded-lg border border-border/70 bg-surface-2/50 p-4">
                    <div className="mb-2 flex items-center justify-between text-[12px]">
                      <span>AI credits used</span>
                      <span className="text-muted-foreground">1,240 / 2,000</span>
                    </div>
                    <ProgressBar value={62} />
                  </div>
                </div>
              )}

              {tab === "Billing" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { name: "Starter", price: "$0", perks: ["3 projects", "Basic AI", "2 seats"] },
                    { name: "Pro", price: "$24", perks: ["Unlimited projects", "Full Nexus AI", "10 seats"], current: true },
                    { name: "Scale", price: "$79", perks: ["SSO & audit log", "Priority AI", "Unlimited seats"] },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className={cn(
                        "rounded-xl border p-4",
                        p.current
                          ? "border-[oklch(0.6_0.2_272_/_0.55)] bg-[oklch(0.6_0.2_272_/_0.08)]"
                          : "border-border/70 bg-surface",
                      )}
                    >
                      <p className="text-[13px] font-medium">{p.name}</p>
                      <p className="mt-1 font-display text-2xl font-semibold">
                        {p.price}
                        <span className="text-[11px] font-normal text-muted-foreground">/mo</span>
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {p.perks.map((perk) => (
                          <li key={perk} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Check className="size-3 text-[oklch(0.75_0.16_160)]" /> {perk}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={cn(
                          "mt-4 w-full rounded-lg py-2 text-[11px] font-semibold",
                          p.current ? "border border-border/70 text-muted-foreground" : "text-primary-foreground",
                        )}
                        style={p.current ? undefined : { background: "var(--gradient-ai)" }}
                      >
                        {p.current ? "Current plan" : "Upgrade"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </motion.div>
      </div>
    </PageShellMotion>
  );
}
