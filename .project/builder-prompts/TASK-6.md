# TASK-6: Schedule Timeline + Earnings Card

## What You're Building
Two standalone components that calculate and display the event-day schedule and employee earnings.

## Dependencies
- TASK-2 (needs booking data types/structure)
- These are pure UI components — can be built in parallel with TASK-4 and TASK-5

## Files to Create

### `components/ScheduleTimeline.tsx`

**Props:**
```typescript
{
  eventStartTime: string      // e.g. "2:00 PM"
  extraHours: number           // 0-6
  travelDriveMinutes: number   // one-way drive time
  eventDate: string            // for display
}
```

**Calculation Logic:**
1. **Start serving** = `eventStartTime` (what customer selected)
2. **Service ends** = start serving + 2 hours + `extraHours`
3. **Arrive at event** = start serving - 30 minutes (setup time)
4. **Leave shop** = arrive at event - `travelDriveMinutes`
5. **Arrive at shop** = leave shop - 20 minutes (buffer to load cart)

**Display:**
A vertical timeline with dots and connecting lines:
```
SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
○ 12:45 PM  Arrive at shop
│            20 min buffer to prep
○  1:05 PM  Leave shop
│            ~25 min drive
○  1:30 PM  Arrive at event
│            30 min setup
● 2:00 PM  Start serving ← highlighted
│            2 hours service
○  4:00 PM  Service ends
```

- Use filled dot (●) for "Start serving" (the main event)
- Use open dots (○) for other milestones
- Show duration labels between milestones
- Clean, monospace-friendly layout
- Format all times as "h:mm AM/PM"

**Time math helper:** Parse "2:00 PM" format, add/subtract minutes, format back. Handle AM/PM crossovers correctly.

### `components/EarningsCard.tsx`

**Props:**
```typescript
{
  extraHours: number              // 0-6
  travelDriveMinutes: number      // one-way drive time in minutes
  travelDistanceMiles: number     // one-way distance
}
```

**Constants:**
- `HOURLY_RATE = 15.00` (per employee)
- `IRS_MILEAGE_RATE = 0.725` (per mile)

**Calculation Logic:**
- Service hours = 2 + extraHours
- Drive time hours = (travelDriveMinutes * 2) / 60 (round trip)
- Hourly pay = (service hours + drive time hours) × HOURLY_RATE
- Round trip miles = travelDistanceMiles × 2
- Mileage reimbursement = round trip miles × IRS_MILEAGE_RATE
- Total = hourly pay + mileage reimbursement

**Display:**
Two clearly separated sections:

```
HOURLY PAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service time:  2 hrs × $15.00 = $30.00
Drive time:   50 min × $15.00 = $12.50
───────────────────────────────────
Subtotal:                     $42.50

MILEAGE REIMBURSEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30 mi round trip × $0.725   = $21.75
(IRS standard rate — paid on top of hourly)

───────────────────────────────────
TOTAL EARNINGS:  $64.25 (before tips)
```

- Format all dollar amounts to 2 decimal places
- Show the math clearly (employees should be able to verify)
- "before tips" note at the bottom
- Mileage section clearly labeled as separate from hourly

## Design Notes
- Both components will be used inside the event detail page (TASK-7)
- Keep them self-contained with no external dependencies beyond React
- Match the app's design language (black/white/amber)
- Mobile-friendly — these will be viewed on phones

## Success Criteria
- Schedule timeline correctly calculates all 5 milestone times
- AM/PM transitions work correctly (e.g., 12:30 PM - 45 min = 11:45 AM)
- Earnings card shows correct hourly + mileage math
- Both components render cleanly on mobile
- All dollar amounts formatted to 2 decimal places
- Drive time shown in minutes (not decimal hours) in the display
