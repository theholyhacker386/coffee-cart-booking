// Script to create push notification tables and add columns to cc_bookings
// Run with: node scripts/add-push-tables.js
//
// Approach: Use the supabase-js client to test if table/columns exist,
// and if not, provide the SQL to run manually.

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xpejjcbobrplbhudxwgr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZWpqY2JvYnJwbGJodWR4d2dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE3ODc2NCwiZXhwIjoyMDgyNzU0NzY0fQ.FbuN7_MpvvgEvMifJEOG-qgt443x7Jfw2EjDfiQ8A1s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // Test 1: Check if cc_push_subscriptions table exists
  console.log('Checking if cc_push_subscriptions table exists...')
  const { error: tableErr } = await supabase
    .from('cc_push_subscriptions')
    .select('id')
    .limit(1)

  if (tableErr && tableErr.message.includes('does not exist')) {
    console.log('  Table does NOT exist yet. Needs to be created.')
  } else if (tableErr) {
    console.log('  Table check returned error:', tableErr.message)
  } else {
    console.log('  Table already exists!')
  }

  // Test 2: Check if staffing column exists on cc_bookings
  console.log('Checking if staffing column exists on cc_bookings...')
  const { data: testBooking, error: colErr } = await supabase
    .from('cc_bookings')
    .select('staffing')
    .limit(1)

  if (colErr && colErr.message.includes('staffing')) {
    console.log('  staffing column does NOT exist yet.')
  } else {
    console.log('  staffing column exists (or table is empty):', testBooking)
  }

  // Test 3: Check if day_before_reminder_sent column exists
  console.log('Checking reminder columns...')
  const { error: remErr } = await supabase
    .from('cc_bookings')
    .select('day_before_reminder_sent, hour_before_reminder_sent')
    .limit(1)

  if (remErr) {
    console.log('  Reminder columns may not exist:', remErr.message)
  } else {
    console.log('  Reminder columns exist!')
  }

  console.log('\n========================================')
  console.log('If any of the above items need to be created,')
  console.log('run this SQL in your Supabase SQL Editor:')
  console.log('========================================\n')

  console.log(`-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS cc_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES cc_employees(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cc_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_push_sub_employee ON cc_push_subscriptions(employee_id);

-- Add staffing column
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS staffing integer DEFAULT 1;

-- Add reminder tracking columns
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS day_before_reminder_sent boolean DEFAULT false;
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS hour_before_reminder_sent boolean DEFAULT false;
`)
}

main().catch(console.error)
