# TASK-5: Employee Dashboard

## What You're Building
The main screen employees see after logging in — a list of upcoming (and past) events with progress indicators.

## Dependencies
- TASK-4 must be complete (auth + employee pages exist)
- TASK-3 should be complete (bookings in database to display)

## Files to Create

### `app/employee/dashboard/page.tsx`
The dashboard page:

**Layout:**
- Two tabs at top: "Upcoming" (default active) and "Past"
- List of event cards below

**Upcoming tab:**
- Fetches bookings where `event_date >= today` from `cc_bookings`
- Sorted by date ascending (soonest first)
- Shows EventCard for each booking
- If no upcoming events: "No upcoming events" message

**Past tab:**
- Fetches bookings where `event_date < today`
- Sorted by date descending (most recent first)
- Shows EventCard in a muted/dimmed style
- Past events are read-only

**Data fetching:**
- Use server component or client-side fetch to `/api/bookings`
- Include checklist progress (count of completed items vs total)

### `app/api/bookings/route.ts`
GET endpoint:
- Requires valid employee cookie (check in route)
- Query params: `?filter=upcoming` or `?filter=past`
- Upcoming: `event_date >= today`, ordered by `event_date ASC`
- Past: `event_date < today`, ordered by `event_date DESC`
- For each booking, also count checklist items (total and completed)
- Returns array of bookings with progress

### `components/EventCard.tsx`
A card component showing one event:

**Props:** booking data + checklist progress

**Display:**
- Date (formatted nicely: "Sat, Feb 20")
- Event type (Wedding, Birthday, etc.)
- Customer name
- Package name (displayed human-readable: "Premium Espresso", not "premium")
- Status badge if pending: "Pending Approval" in amber
- Progress: "5 of 22 items done" with mini progress bar
- Entire card is tappable → navigates to `/employee/event/[id]`

**Package name mapping:**
- `drip` → "Drip Coffee"
- `standard` → "Standard Espresso"
- `premium` → "Premium Espresso"
- `kombucha` → "Kombucha Bar"
- `hotchoc` → "Hot Chocolate Bar"
- `null` (public event) → "Public Event"

**Styling:**
- Card with subtle border/shadow
- Clean typography
- Mobile-optimized (full width on small screens)
- Amber accent for dates/highlights

### `components/ChecklistProgress.tsx`
A progress bar component:

**Props:** `completed: number`, `total: number`

**Display:**
- Horizontal bar showing completion percentage
- Text: "X of Y done"
- Color: fills from left, amber/green gradient
- If 100%: green with checkmark

## Design Notes
- Dashboard should feel like a clean task management app
- Cards should have enough info to know what's coming without opening
- Use the same styling patterns as the customer side
- Mobile-first — employees use phones

## Success Criteria
- Dashboard loads and shows bookings from database
- Upcoming/Past tabs work correctly
- Event cards show correct info and progress
- Tapping a card navigates to event detail page
- Pending bookings show status badge
- Empty state message when no events
