// Helper to send push notifications to employees
// Uses the web-push library (CommonJS module)

import { createServiceRoleClient } from '@/lib/supabase/server'

// web-push is a CommonJS module — use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push')

function initVapid() {
  webpush.setVapidDetails(
    'mailto:theporchkombuchabar@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

/**
 * Send push to all employees, but skip those who have
 * notify_two_person_only = true when the event is a 1-person (solo) event.
 *
 * @param title  - notification title
 * @param body   - notification body text
 * @param url    - link to open when tapped
 * @param tag    - notification tag for grouping
 * @param staffing - 1 or 2; when 1, employees who only want 2-person events are skipped
 */
export async function sendPushToEligible(
  title: string,
  body: string,
  url?: string,
  tag?: string,
  staffing?: number
) {
  initVapid()

  const supabase = createServiceRoleClient()

  // Fetch push subscriptions joined with employee preferences
  const { data: subscriptions } = await supabase
    .from('cc_push_subscriptions')
    .select('employee_id, subscription, cc_employees!inner(notify_two_person_only)')

  if (!subscriptions || subscriptions.length === 0) return 0

  let sent = 0
  for (const sub of subscriptions) {
    // Check notification preference
    const employee = sub.cc_employees as unknown as { notify_two_person_only: boolean }
    if (employee?.notify_two_person_only && staffing === 1) {
      // This employee only wants 2-person events — skip
      continue
    }

    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title,
          body,
          url: url || '/employee/dashboard',
          tag: tag || 'porch-notification',
        })
      )
      sent++
    } catch (err: unknown) {
      const pushErr = err as { statusCode?: number; message?: string }
      // If subscription is expired/invalid, remove it
      if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
        await supabase
          .from('cc_push_subscriptions')
          .delete()
          .eq('subscription', sub.subscription)
      }
      console.error('Push send error:', pushErr.message)
    }
  }
  return sent
}

/**
 * Legacy wrapper — sends to all employees (no filtering).
 * Equivalent to sendPushToEligible with no staffing filter.
 */
export async function sendPushToAll(title: string, body: string, url?: string, tag?: string) {
  return sendPushToEligible(title, body, url, tag)
}

/**
 * Send push notifications only to specific employees (by their IDs).
 * Used for reminders to assigned employees.
 */
export async function sendPushToAssigned(
  employeeIds: string[],
  title: string,
  body: string,
  url?: string,
  tag?: string
) {
  if (!employeeIds || employeeIds.length === 0) return 0

  initVapid()

  const supabase = createServiceRoleClient()

  const { data: subscriptions } = await supabase
    .from('cc_push_subscriptions')
    .select('employee_id, subscription')
    .in('employee_id', employeeIds)

  if (!subscriptions || subscriptions.length === 0) return 0

  let sent = 0
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title,
          body,
          url: url || '/employee/dashboard',
          tag: tag || 'porch-notification',
        })
      )
      sent++
    } catch (err: unknown) {
      const pushErr = err as { statusCode?: number; message?: string }
      if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
        await supabase
          .from('cc_push_subscriptions')
          .delete()
          .eq('subscription', sub.subscription)
      }
      console.error('Push send error:', pushErr.message)
    }
  }
  return sent
}
