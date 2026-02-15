// Temporary migration endpoint — run once then delete
// Hits: GET /api/admin/migrate?key=porch-cron-2026

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== 'porch-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: string[] = []

  // Test if cc_push_subscriptions table exists
  const { error: tableErr } = await supabase
    .from('cc_push_subscriptions')
    .select('id')
    .limit(1)

  if (tableErr) {
    results.push(`cc_push_subscriptions check: ${tableErr.message}`)
  } else {
    results.push('cc_push_subscriptions: already exists')
  }

  // Test if staffing column exists
  const { error: staffErr } = await supabase
    .from('cc_bookings')
    .select('staffing')
    .limit(1)

  if (staffErr) {
    results.push(`staffing column check: ${staffErr.message}`)
  } else {
    results.push('staffing column: already exists')
  }

  // Test reminder columns
  const { error: remErr } = await supabase
    .from('cc_bookings')
    .select('day_before_reminder_sent')
    .limit(1)

  if (remErr) {
    results.push(`reminder columns check: ${remErr.message}`)
  } else {
    results.push('reminder columns: already exist')
  }

  return NextResponse.json({
    message: 'Migration check complete. If items show errors, run the SQL manually.',
    results,
    sql: `
-- Run this in the Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS cc_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES cc_employees(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cc_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_push_sub_employee ON cc_push_subscriptions(employee_id);
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS staffing integer DEFAULT 1;
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS day_before_reminder_sent boolean DEFAULT false;
ALTER TABLE cc_bookings ADD COLUMN IF NOT EXISTS hour_before_reminder_sent boolean DEFAULT false;
    `.trim()
  })
}
