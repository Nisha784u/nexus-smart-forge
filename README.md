# NexusFlow

NexusFlow is a premium dark SaaS workspace for product teams. It combines project
planning, task execution, boards, calendar views, team workload, notifications,
and AI-assisted planning in one focused interface.

This repository contains the current frontend application imported from Lovable
and adapted for Replit. The existing UI and route structure are intentionally
preserved.

## Current features

- NexusFlow login, signup, and password-reset entry screens
- Dashboard with project KPIs, task analytics, activity, and AI recommendations
- Task list with search, status, priority, project, and assignee filters
- Task detail pages with status changes, subtasks, comments, and AI actions
- Projects in grid or list view with sorting and search
- Drag-and-drop Kanban board with quick task creation
- Calendar with month, week, and day views
- Team workload and capacity overview
- AI Assistant conversation surface
- AI Task Generator with selectable generated tasks
- Portfolio insights and delivery-risk visualizations
- Notifications with unread, mention, and AI filters
- Profile, workspace, notification, AI, and billing settings surfaces
- Browser persistence for task and notification changes using `localStorage`
- Responsive dark theme with motion-based page and component transitions

## Technology

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS v4
- Motion for React animations
- Recharts for analytics
- Radix UI primitives and Lucide icons

## Project structure

```text
src/
  components/nexus/   Product-specific shell, auth, AI, and UI components
  components/ui/      Reusable Radix-based UI primitives
  lib/                Seed data, client workspace state, and utilities
  routes/             TanStack file-based application routes
  styles.css          Theme tokens and global styling
public/               Static assets
```

## Run locally

Requirements: Node.js 20+ and npm or Bun.

```bash
npm install
npm run dev
```

The Replit preview workflow runs the same Vite dev server on port 5000.

## Verify

```bash
npm run build
npm run lint
```

## Data and authentication boundary

The imported application currently has no backend, database, external API, or
real authentication service. Workspace records begin from seeded product data.
Task status changes, new tasks, and notification read states are persisted in
the browser for the current device using `localStorage`; they are not shared
between users or devices.

The authentication screens are currently navigation-only product flows. Before
launching with real accounts, add an identity provider and a server-side data
layer, then move tasks, projects, comments, notifications, and memberships out
of the client seed data. Do not treat the current demo identity or browser
storage as production account security.

No environment variables are required for the current frontend-only build.

## Deployment

Run the production build with `npm run build`, then publish the Replit project
using its web deployment flow. A production database and authentication
integration should be connected before enabling real multi-user workspaces.

## Future improvements

1. Add authenticated workspaces and role-based access.
2. Persist projects, tasks, comments, events, and notifications in PostgreSQL.
3. Add validated REST or server functions for CRUD operations.
4. Connect the AI surfaces to a managed model integration.
5. Add automated route, interaction, accessibility, and persistence tests.