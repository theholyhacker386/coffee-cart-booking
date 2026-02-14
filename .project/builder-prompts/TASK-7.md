# TASK-7: Event Detail Page + Swipeable Checklist

## What You're Building
The main employee view — when they tap an event, they see the full schedule, earnings, event details, and a swipeable checklist. This is the heart of the employee experience.

## Dependencies
- TASK-5 (dashboard exists to navigate from)
- TASK-6 (ScheduleTimeline and EarningsCard components)
- TASK-3 (checklist items exist in database)

## Files to Create

### `app/employee/event/[id]/page.tsx`
The full event detail page. Sections in order from top to bottom:

**1. Header:**
- Back arrow → returns to dashboard
- Event title: "[Event Type] — [Customer Name]"
- Status badge (pending/confirmed/completed)

**2. Schedule Timeline** (import from components/ScheduleTimeline.tsx)
- Pass booking's event_start_time, extra_hours, travel_drive_minutes

**3. Earnings Estimate** (import from components/EarningsCard.tsx)
- Pass booking's extra_hours, travel_drive_minutes, travel_distance_miles

**4. Event Details Card:**
Display all relevant info:
- Customer name
- Event type (Wedding, Birthday, etc.)
- Event date (formatted: "Saturday, February 20, 2026")
- Event address — make it a link that opens in Maps app:
  - iOS: `maps://` or `https://maps.apple.com/?q=`
  - Android: `https://www.google.com/maps/search/?api=1&query=`
  - Use `https://maps.google.com/?q=` as universal fallback
- Day-of contact: name + phone (phone as `tel:` link for tap-to-call)
- Package type (human readable name)
- Number of drinks
- Payment method (human readable)
- Indoor/Outdoor
- Power: Yes/No (+ distance from power if yes)
- Sink: Yes/No
- Trash on site: Yes/No
- Drive: [X] miles, ~[Y] min
- Additional details / special requests (if any)

**5. Day-Before Prep Checklist** (shows only if event is tomorrow or today):
- Section header: "Day-Before Prep"
- ChecklistProgress bar for day_before phase only
- List of SwipeableChecklistItem for items where `phase === 'day_before'`
- Show this section if event_date is tomorrow OR today (they might prep same-day)

**6. Day-Of Checklist:**
- Section header: "Loading Checklist"
- ChecklistProgress bar for day_of phase only
- List of SwipeableChecklistItem for items where `phase === 'day_of'`
- Items grouped by category with category headers
- When ALL day_of items are complete: show "Ready to Go!" celebration
  - Confetti or fun animation
  - Big green checkmark

**7. Event Completed Button:**
- Appears ONLY after "Ready to Go!" (all day-of items done)
- Large button: "Mark Event as Completed"
- Tapping it:
  - Calls `/api/bookings/[id]/complete`
  - Updates booking status to "completed"
  - Sends admin mileage email to Jennifer
  - Shows confirmation

**Data Fetching:**
- Fetch booking data + checklist items from API
- Client component (needs interactivity for swipes)

### `components/SwipeableChecklistItem.tsx`
The swipe-to-complete interaction:

**Props:**
```typescript
{
  id: string
  text: string
  completed: boolean
  completedBy?: string
  onComplete: (id: string) => void
}
```

**Behavior:**
- Touch/drag: track horizontal swipe with touch events
- Swipe LEFT to mark as done
- Show green background with checkmark as user swipes
- When swiped past threshold (50% of width): animate off screen, call onComplete
- If released before threshold: spring back
- Already-completed items show with strikethrough and muted style
- Smooth 300ms transition animation

**Touch Event Implementation:**
```
onTouchStart → record start X
onTouchMove → calculate deltaX, translate item, show green bg
onTouchEnd → if deltaX > threshold, complete; else spring back
```

**Desktop fallback:** Also support mouse drag (mousedown/mousemove/mouseup) for testing

### `app/api/bookings/[id]/checklist/route.ts`
**GET:** Fetch all checklist items for a booking
- Returns items sorted by phase (day_before first), then sort_order
- Requires valid employee cookie

**PATCH:** Update a checklist item
- Body: `{ itemId, completed, completedBy }`
- Updates the item's completed status, completed_by, completed_at
- Returns updated item

### `app/api/bookings/[id]/complete/route.ts`
**POST:** Mark event as completed
- Updates booking status to "completed"
- Sends admin email to Jennifer with mileage summary:

```
Subject: Mileage Reimbursement — [Event Type] — [Event Date]

MILEAGE REIMBURSEMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event: [Customer Name]'s [Event Type] — [Event Date]
Round trip: [X] miles

Employee 1: [X] mi × $0.725 = $[amount]
Employee 2: [X] mi × $0.725 = $[amount]
───────────────────────────────────
Total mileage owed: $[total]
```

- Uses Resend to send (same setup as existing email route)
- Jennifer's email: shopcolby@gmail.com
- Returns `{ success: true }`

### `app/globals.css` (MODIFY — append to existing)
Add swipe animations:
```css
/* Swipe checklist animations */
.checklist-item-enter {
  animation: slideIn 0.3s ease-out;
}

.checklist-item-exit {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; height: 0; margin: 0; padding: 0; }
}
```

## Design Notes
- This is the most content-heavy page — use collapsible sections or good spacing
- The swipe interaction is the hero feature — make it feel smooth and satisfying
- "Ready to Go!" should feel like a reward/celebration
- Event details should use icons from lucide-react where appropriate
- Maps link and phone link should be obvious (underlined, blue, or with icons)
- Category headers in checklist: small, uppercase, muted text

## Success Criteria
- Event page loads with all sections populated
- Schedule timeline shows correct calculated times
- Earnings card shows correct math
- Event details display all booking info
- Address opens in maps, phone opens dialer
- Swipe left on checklist item marks it complete
- Swipe springs back if not past threshold
- Progress bar updates in real-time
- "Ready to Go!" appears when all day-of items done
- "Event Completed" button sends mileage email
- Day-before checklist only shows when event is tomorrow/today
- Works smoothly on mobile (touch events)
