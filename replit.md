# NexusFlow

## Project overview

NexusFlow is a React/TanStack Start project-management frontend with a premium
dark visual system. It includes dashboards, tasks, projects, Kanban, calendar,
team workload, notifications, settings, and AI-oriented planning surfaces.

The current imported app is frontend-only. Seed data is intentionally kept in
`src/lib/nexus-data.ts`; task and notification mutations persist locally in the
browser through `src/lib/nexus-store.tsx`. There is no production backend or
authentication provider connected yet.

## User preferences

- Preserve the existing NexusFlow visual identity and route structure.
- Prefer focused, production-minded changes over broad rewrites.
- Keep the interface sophisticated and responsive without excessive neon,
  gradients, glassmorphism, or decorative animation.
- Use Nisha Rao as the primary demo profile and Indian names for sample team
  members.