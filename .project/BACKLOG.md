# Backlog — Employee Checklist Feature

## TASK-1: Supabase Tables + RLS
**Status:** Pending
**Priority:** Critical (blocks everything)
**Files:** SQL migrations only (no app files)
**Description:**
- Create 3 tables: `cc_employees`, `cc_bookings`, `cc_checklist_items`
- Enable RLS on all 3 tables
- Policy: allow all operations only via service role key (anon key blocked)
- Add real Supabase credentials to `.env.local` (from Triply Vintage project)
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Table Schemas:

**cc_employees:**
- id (uuid, PK, default gen_random_uuid())
- name (text, not null)
- pin_hash (text, not null)
- created_at (timestamptz, default now())

**cc_bookings:**
- id (uuid, PK, default gen_random_uuid())
- status (text, default 'pending') — pending | confirmed | completed
- event_category (text) — private | public
- customer_name (text)
- phone (text)
- email (text)
- event_date (date)
- event_start_time (text)
- event_address (text)
- event_type (text)
- custom_event_type (text, nullable)
- indoor_outdoor (text)
- power_available (text)
- distance_from_power (text, nullable)
- sink_available (text)
- trash_on_site (text)
- contact_name (text)
- contact_phone (text)
- payment_method (text, nullable)
- drink_package (text, nullable)
- number_of_drinks (integer, nullable)
- drink_limit (text, nullable)
- extra_hours (integer, default 0)
- hot_chocolate_addon (boolean, default false)
- kombucha_addon (boolean, default false)
- travel_distance_miles (numeric, nullable)
- travel_drive_minutes (numeric, nullable)
- travel_fee (numeric, nullable)
- total_estimate (numeric, nullable)
- estimated_people (text, nullable)
- how_heard_about_us (text, nullable)
- additional_details (text, nullable)
- signature (text, nullable)
- created_at (timestamptz, default now())

**cc_checklist_items:**
- id (uuid, PK, default gen_random_uuid())
- booking_id (uuid, FK → cc_bookings.id, on delete cascade)
- item_text (text, not null)
- category (text) — e.g. "loading", "equipment", "venue", "payment", "supplies"
- phase (text) — "day_before" | "day_of"
- sort_order (integer)
- completed (boolean, default false)
- completed_by (uuid, nullable, FK → cc_employees.id)
- completed_at (timestamptz, nullable)
- created_at (timestamptz, default now())

---

## TASK-2: Supabase Client/Server Helpers
**Status:** Pending
**Depends on:** TASK-1 (needs credentials)
**Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`
**Description:**
- Browser client using `@supabase/ssr` createBrowserClient
- Server client using `@supabase/ssr` createServerClient with cookies
- Service role client for API routes (bypasses RLS)

---

## TASK-3: Wire Booking Form to Save to Supabase
**Status:** Pending
**Depends on:** TASK-2
**Files:** `app/api/send-email/route.ts` (modify), `lib/checklist-generator.ts` (new)
**Description:**
- In `send-email/route.ts`: after sending emails, also save booking to `cc_bookings`
- Generate checklist items and insert into `cc_checklist_items`
- Build `lib/checklist-generator.ts` with all checklist logic:
  - Universal items (every event)
  - Package-specific items (drip, standard espresso, premium espresso, kombucha, hot chocolate)
  - Venue-specific items (no power → generator, outdoor → canopy, etc.)
  - Payment method items
  - Add-on items
  - Day-before prep items (per package)
  - Public event fallback checklist
- Checklist items should include dynamic values (customer name, phone, distance, etc.)

---

## TASK-4: Employee Auth (Sign-up + PIN Login)
**Status:** Pending
**Depends on:** TASK-2
**Files:** `lib/employee-auth.ts`, `app/api/employee/login/route.ts`, `app/api/employee/signup/route.ts`, `app/api/employee/logout/route.ts`, `middleware.ts`, `components/PinPad.tsx`, `app/employee/page.tsx`, `app/employee/layout.tsx`
**Description:**
- `lib/employee-auth.ts`: PIN hashing (bcrypt or crypto.subtle), cookie management (7-day expiry)
- Sign-up: name + PIN + invite code ("PorchCrew2026") → creates employee
- Login: name + PIN → validates, sets cookie
- Logout: clears cookie
- `middleware.ts`: redirects unauthenticated `/employee/dashboard` and `/employee/event/*` to `/employee`
- `components/PinPad.tsx`: number pad UI (0-9 digits, backspace, submit)
- `app/employee/page.tsx`: login/sign-up screen with toggle between modes
- `app/employee/layout.tsx`: wrapper with employee nav header

---

## TASK-5: Employee Dashboard
**Status:** Pending
**Depends on:** TASK-4
**Files:** `app/employee/dashboard/page.tsx`, `components/EventCard.tsx`, `components/ChecklistProgress.tsx`
**Description:**
- Fetch all bookings from `cc_bookings`
- Two tabs: "Upcoming" (default) and "Past"
- Sort upcoming by date ascending, past by date descending
- Each event card shows: date, event type, customer name, package, progress (X of Y items done)
- Pending bookings show "Pending Approval" badge
- Tap card navigates to `/employee/event/[id]`
- `components/EventCard.tsx`: reusable event card
- `components/ChecklistProgress.tsx`: progress bar component

---

## TASK-6: Schedule Timeline + Earnings Card
**Status:** Pending
**Depends on:** TASK-2 (needs booking data structure)
**Files:** `components/ScheduleTimeline.tsx`, `components/EarningsCard.tsx`
**Description:**
- `ScheduleTimeline.tsx`: calculates and displays timeline
  - Arrive at shop = leave shop - 20 min
  - Leave shop = arrive at event - drive time
  - Arrive at event = start serving - 30 min
  - Start serving = event start time
  - Service ends = start serving + 2 hrs + extra hours
- `EarningsCard.tsx`: shows hourly pay + mileage as separate sections
  - Hourly: service hours × $15 + drive time × $15
  - Mileage: round trip miles × $0.725
  - Total earnings

---

## TASK-7: Event Detail Page + Swipeable Checklist
**Status:** Pending
**Depends on:** TASK-5, TASK-6
**Files:** `app/employee/event/[id]/page.tsx`, `components/SwipeableChecklistItem.tsx`, `app/api/bookings/[id]/checklist/route.ts`, `app/api/bookings/route.ts`, `app/api/bookings/[id]/complete/route.ts`, `app/globals.css` (add swipe animations)
**Description:**
- Main event page combining: schedule timeline, earnings, event details, checklist
- Event details card: all venue/customer info, links to maps, tap-to-call
- Day-before checklist (visible day before event)
- Day-of checklist (visible on event day)
- `SwipeableChecklistItem.tsx`: touch swipe left to mark done, slides off screen
- API routes for fetching/updating checklist items
- Progress bar per phase
- "Ready to Go!" celebration when all day-of items complete
- "Event Completed" button (separate from checklist completion)
- Event Completed → sends admin mileage email to Jennifer
- Swipe CSS animations in globals.css

---

## TASK-8: Fix Existing Bugs
**Status:** Pending
**Depends on:** None
**Files:** `app/api/send-email/route.ts`
**Description:**
- Fix public event customer email showing incorrect package/pricing sections
- Update customer email contact info placeholders ([YOUR PHONE], [YOUR EMAIL], [YOUR WEBSITE])
- These are pre-existing bugs from state.json

---

## TASK-9: Deploy + Environment
**Status:** Pending
**Depends on:** All other tasks
**Files:** Netlify config, `.env.local`
**Description:**
- Add Supabase env vars to Netlify dashboard
- Test full flow end-to-end
- Deploy to production
