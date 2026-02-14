# Architecture — The Porch Coffee Cart

## Tech Stack
- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript + React 19
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) — shared project with Triply Vintage, tables prefixed `cc_`
- **Email**: Resend API
- **SMS**: Twilio
- **Maps**: Google Maps API (address autocomplete + distance calculation)
- **Hosting**: Netlify

## Directory Structure
```
coffee-cart-booking/
├── app/
│   ├── api/
│   │   ├── send-email/route.ts          # Booking submission → emails + SMS
│   │   ├── employee/                    # NEW: login/signup/logout routes
│   │   └── bookings/                    # NEW: booking CRUD + checklist
│   ├── customer/
│   │   ├── page.tsx                     # Landing page
│   │   └── book/page.tsx                # Booking inquiry form (1444 lines)
│   ├── employee/                        # NEW: employee UI (exists but empty)
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # PIN login/signup
│   │   ├── dashboard/page.tsx           # Event list
│   │   └── event/[id]/page.tsx          # Event detail + checklist
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                         # Redirects to /customer
├── components/                          # NEW: shared UI components
├── lib/
│   ├── utils.ts                         # cn() helper
│   ├── supabase/client.ts               # NEW
│   ├── supabase/server.ts               # NEW
│   ├── checklist-generator.ts           # NEW
│   └── employee-auth.ts                 # NEW
├── middleware.ts                         # NEW: protect /employee routes
├── .env.local
└── .project/
```

## Data Flow
1. Customer submits booking form → `/api/send-email` → emails + SMS + saves to `cc_bookings` + generates checklist items
2. Employee logs in with name + PIN → cookie set for 7 days
3. Employee dashboard reads `cc_bookings` (upcoming/past)
4. Employee opens event → sees schedule, earnings, details, checklist
5. Employee swipes checklist items → PATCH to update `cc_checklist_items`
6. Employee taps "Event Completed" → sends admin mileage email to Jennifer

## Database Tables (Supabase — `cc_` prefix)
- `cc_employees` — name, hashed PIN, created_at
- `cc_bookings` — all booking data from form + travel calculations + status
- `cc_checklist_items` — per-booking checklist items (day_before/day_of phases)

## Key Constants
- Home base: 212 S Beach Street, Daytona Beach, FL
- Employee hourly rate: $15.00/hr
- IRS mileage rate: $0.725/mile
- Setup time at venue: 30 min
- Shop buffer time: 20 min
- Free travel miles: 10
