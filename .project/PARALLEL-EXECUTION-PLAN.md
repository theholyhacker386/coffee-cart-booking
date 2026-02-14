# Parallel Execution Plan
Generated: 2026-02-14 08:31 EST

## Summary
- **Max parallel agents**: 3
- **Total tasks identified**: 9
- **Estimated waves**: 4 (groups that must run sequentially)

## Wave 1 (Start Immediately)
These tasks have no dependencies and low conflict risk with each other:

| Task | Files/Modules | Conflict Risk | Notes |
|------|---------------|---------------|-------|
| TASK-1 | SQL only + `.env.local` | Low | Database setup — no app code touched |
| TASK-6 | `components/ScheduleTimeline.tsx`, `components/EarningsCard.tsx` | Low | Pure UI components, brand new files, no overlap |
| TASK-8 | `app/api/send-email/route.ts` | Low | Bug fixes in existing file — separate from TASK-3's additions |

**Notes:**
- TASK-1 only touches `.env.local` and runs SQL — zero conflict with anything
- TASK-6 creates two new component files — nobody else touches these
- TASK-8 fixes bugs in `send-email/route.ts` — TASK-3 also modifies this file BUT adds code at a different location (after emails). **TASK-8 must merge first** so TASK-3 works on the clean version

## Wave 2 (After Wave 1)
These depend on Wave 1 tasks:

| Task | Depends On | Files/Modules | Conflict Risk |
|------|------------|---------------|---------------|
| TASK-2 | TASK-1 | `lib/supabase/client.ts`, `lib/supabase/server.ts` | Low — new files |
| TASK-4 | TASK-2 | `lib/employee-auth.ts`, `middleware.ts`, `components/PinPad.tsx`, `app/employee/page.tsx`, `app/employee/layout.tsx`, `app/api/employee/*` | Low — all new files |
| TASK-3 | TASK-2 + TASK-8 | `app/api/send-email/route.ts` (modify), `lib/checklist-generator.ts` (new) | Medium — modifies send-email route (TASK-8 must be merged first) |

**Parallelization within Wave 2:**
- TASK-2 runs first (quick — just 2 small files)
- Then TASK-3 and TASK-4 can run **in parallel** (no file overlap)

| Sub-wave | Tasks in Parallel | Max Agents |
|----------|-------------------|------------|
| 2a | TASK-2 | 1 |
| 2b | TASK-3 + TASK-4 | 2 |

## Wave 3 (After Wave 2)
| Task | Depends On | Files/Modules | Conflict Risk |
|------|------------|---------------|---------------|
| TASK-5 | TASK-4 | `app/employee/dashboard/page.tsx`, `components/EventCard.tsx`, `components/ChecklistProgress.tsx`, `app/api/bookings/route.ts` | Low — all new files |

**Note:** TASK-5 can only start after TASK-4 because it needs the employee layout, auth middleware, and login flow to exist. Only 1 agent needed.

## Wave 4 (After Wave 3)
| Task | Depends On | Files/Modules | Conflict Risk |
|------|------------|---------------|---------------|
| TASK-7 | TASK-5 + TASK-6 + TASK-3 | `app/employee/event/[id]/page.tsx`, `components/SwipeableChecklistItem.tsx`, `app/api/bookings/[id]/*`, `app/globals.css` | Low — all new files except globals.css append |
| TASK-9 | ALL | Netlify config, env vars | Low — deploy only |

**Note:** TASK-7 is the big one — it pulls together components from TASK-5 (dashboard nav), TASK-6 (timeline + earnings), and TASK-3 (checklist data). Must run after all of those.

## Execution Timeline

```
Wave 1:  [TASK-1] [TASK-6] [TASK-8]    ← 3 agents in parallel
           │         │        │
Wave 2a:   └─→ [TASK-2]      │         ← 1 agent (fast)
                 │     │      │
Wave 2b:    [TASK-3]←─┘  [TASK-4]      ← 2 agents in parallel
                           │               (TASK-3 also waits for TASK-8)
Wave 3:                [TASK-5]         ← 1 agent
                           │
Wave 4:                [TASK-7]         ← 1 agent (biggest task)
                           │
Deploy:                [TASK-9]         ← 1 agent
```

## Conflict Avoidance Notes
- **TASK-8 before TASK-3**: Both touch `send-email/route.ts`. TASK-8 fixes bugs, TASK-3 adds new code. TASK-8 must merge first.
- **`app/globals.css`**: TASK-7 appends CSS animations. No other task touches this file in Wave 4, so no conflict.
- **`components/` directory**: Multiple tasks create new files here but never the SAME file. No conflict.
- **`.env.local`**: Only TASK-1 touches this. No conflict.
- **`lib/` directory**: TASK-2, TASK-3, and TASK-4 each create different files. No overlap.

## Builder Prompts Reference

| Task | Prompt Location |
|------|-----------------|
| TASK-1 | `.project/builder-prompts/TASK-1.md` |
| TASK-2 | `.project/builder-prompts/TASK-2.md` |
| TASK-3 | `.project/builder-prompts/TASK-3.md` |
| TASK-4 | `.project/builder-prompts/TASK-4.md` |
| TASK-5 | `.project/builder-prompts/TASK-5.md` |
| TASK-6 | `.project/builder-prompts/TASK-6.md` |
| TASK-7 | `.project/builder-prompts/TASK-7.md` |
| TASK-8 | `.project/builder-prompts/TASK-8.md` |
| TASK-9 | No prompt needed — deploy step |

All builder prompts exist and are ready.

## Pre-Build Note: Jennifer's Checklist Review
Jennifer has requested the ability to review and confirm the checklist items before they're hardcoded. The checklist items in TASK-3's builder prompt should be treated as a DRAFT. Before TASK-3 begins, Jennifer should provide or confirm the actual checklist items she uses. This does NOT block Wave 1 tasks.
