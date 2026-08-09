---
name: Frontend-only boundary
description: Durable product boundary for the imported NexusFlow application.
---

NexusFlow was imported as a frontend-only project with seeded workspace data,
navigation-only auth screens, and no connected database or external API.

**Why:** Adding a fake server would create false production confidence and
break the imported app's intentionally focused UI. Browser persistence is useful
for a single-device demo, but it cannot provide account security or shared
workspace data.

**How to apply:** Before launch, add real authentication and server-backed
workspace CRUD. Keep the README and product copy explicit about the distinction
until those capabilities exist.