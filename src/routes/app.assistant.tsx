import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { NexusOrb } from "@/components/nexus/nexus-orb";
import { PageShellMotion } from "@/components/nexus/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/assistant")({
  head: () => ({
    meta: [
      { title: "Nexus AI Assistant — NexusFlow" },
      { name: "description", content: "Ask Nexus AI about project risk, sprint scope, blockers and workload in a conversational workspace." },
      { property: "og:title", content: "Nexus AI Assistant — NexusFlow" },
      { property: "og:description", content: "Conversational AI for project risk, scope and blockers." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

const prompts = [
  "What's blocking the Mobile App release?",
  "Summarize this week's progress",
  "Who is overloaded right now?",
  "Draft a sprint plan for next week",
];

const replies: string[] = [
  "Mobile App is 72% complete. The critical path runs through Payment Gateway (urgent, due May 20) and Offline sync engine. Billing edge cases in review has been idle 4 days — that's your real blocker.",
  "This week: 38 tasks completed vs 30 created, velocity up 13%. Nexus AI Dashboard hit 90%. Website Redesign slipped to at-risk — design QA is the bottleneck.",
  "Priya is at 94% capacity and Rohan at 84%. Arjun has room at 51%. Moving 2 design QA tasks to Arjun would cut Website Redesign risk by roughly 18%.",
  "Suggested sprint: close Payment Gateway and Billing edge cases first, ship Design System tokens, then start Push notifications. That's 34 points — in line with your 6-week average.",
];

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "ai", text: "I'm Nexus AI. I can see all 4 projects, 16 tasks and your team's capacity. What do you want to know?" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const turn = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || thinking) return;
    setMessages((prev) => [...prev, { id: "u" + Date.now(), role: "user", text: value }]);
    setInput("");
    setThinking(true);
    const reply = replies[turn.current % replies.length]!;
    turn.current += 1;
    window.setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [...prev, { id: "a" + Date.now(), role: "ai", text: reply }]);
      inputRef.current?.focus();
    }, 1100);
  };

  return (
    <PageShellMotion className="flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <div className="flex items-center gap-3 border-b border-border/70 pb-5">
        <NexusOrb size={40} />
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight">Nexus AI Assistant</h1>
          <p className="text-[11px] text-muted-foreground">Context-aware across every project in this workspace</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto py-6">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
          >
            {m.role === "ai" ? (
              <NexusOrb size={28} />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-semibold">
                JD
              </span>
            )}
            <div
              className={cn(
                "max-w-[75%] rounded-xl border px-4 py-3 text-sm leading-relaxed",
                m.role === "ai"
                  ? "border-[oklch(0.6_0.2_272_/_0.3)] bg-[oklch(0.6_0.2_272_/_0.08)]"
                  : "border-border/70 bg-surface",
              )}
            >
              {m.text}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <NexusOrb size={28} />
              <div className="flex gap-1.5 rounded-xl border border-[oklch(0.6_0.2_272_/_0.3)] bg-[oklch(0.6_0.2_272_/_0.08)] px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                    className="size-1.5 rounded-full bg-[oklch(0.72_0.16_280)]"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="border-t border-border/70 pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-[oklch(0.6_0.2_272_/_0.5)] hover:text-foreground"
            >
              <Sparkles className="size-3" /> {p}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 rounded-xl border border-border/70 bg-surface p-2 focus-within:border-[oklch(0.6_0.2_272_/_0.6)]"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask Nexus AI anything about your projects…"
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <motion.button
            type="submit"
            disabled={thinking || !input.trim()}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2.5 text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-ai)" }}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        </form>
      </div>
    </PageShellMotion>
  );
}
