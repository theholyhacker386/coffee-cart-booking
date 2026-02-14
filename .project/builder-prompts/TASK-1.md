# TASK-1: Supabase Tables + RLS

## What You're Building
Set up 3 database tables in Supabase for the employee checklist feature. These tables store bookings, checklist items, and employee accounts.

## Prerequisites
- Access to Supabase project (same one used by Triply Vintage)
- psql at `/opt/homebrew/Cellar/libpq/18.1/bin/psql`

## Step 1: Get Supabase Credentials
Read the Triply Vintage `.env.local` to get the real Supabase URL and keys:
```bash
cat /Users/Jennifer/triply-vintage/.env.local | grep SUPABASE
```
Copy the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` values.

## Step 2: Update Coffee Cart `.env.local`
Replace the placeholder Supabase values in `/Users/Jennifer/coffee-cart-booking/.env.local` with the real ones from Triply Vintage. Also add `SUPABASE_SERVICE_ROLE_KEY` if not present.

## Step 3: Create Tables
Connect to Supabase and run the following SQL. The connection string can be found via the Supabase dashboard or constructed from the project URL.

```sql
-- Employee accounts
CREATE TABLE cc_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Event bookings (mirrors the booking form data)
CREATE TABLE cc_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  event_category text,
  customer_name text,
  phone text,
  email text,
  event_date date,
  event_start_time text,
  event_address text,
  event_type text,
  custom_event_type text,
  indoor_outdoor text,
  power_available text,
  distance_from_power text,
  sink_available text,
  trash_on_site text,
  contact_name text,
  contact_phone text,
  payment_method text,
  drink_package text,
  number_of_drinks integer,
  drink_limit text,
  extra_hours integer DEFAULT 0,
  hot_chocolate_addon boolean DEFAULT false,
  kombucha_addon boolean DEFAULT false,
  travel_distance_miles numeric,
  travel_drive_minutes numeric,
  travel_fee numeric,
  total_estimate numeric,
  estimated_people text,
  how_heard_about_us text,
  additional_details text,
  signature text,
  created_at timestamptz DEFAULT now()
);

-- Checklist items per booking
CREATE TABLE cc_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES cc_bookings(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  category text,
  phase text CHECK (phase IN ('day_before', 'day_of')),
  sort_order integer,
  completed boolean DEFAULT false,
  completed_by uuid REFERENCES cc_employees(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_checklist_booking ON cc_checklist_items(booking_id);
CREATE INDEX idx_bookings_date ON cc_bookings(event_date);
CREATE INDEX idx_bookings_status ON cc_bookings(status);
```

## Step 4: Enable RLS
```sql
ALTER TABLE cc_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_checklist_items ENABLE ROW LEVEL SECURITY;

-- No policies for anon key = anon key is blocked from all operations
-- Service role key bypasses RLS automatically
```

## Step 5: Verify
- Confirm all 3 tables exist
- Confirm RLS is enabled
- Test that the anon key cannot read/write (optional)

## Files Modified
- `/Users/Jennifer/coffee-cart-booking/.env.local` — real Supabase credentials

## Success Criteria
- 3 tables created with correct schemas
- RLS enabled on all 3
- `.env.local` has real Supabase URL, anon key, and service role key
