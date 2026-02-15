import type { Config } from "@netlify/functions"

export default async () => {
  const siteUrl = process.env.URL || 'https://ephemeral-kringle-354679.netlify.app'
  const cronSecret = process.env.CRON_SECRET || ''

  const response = await fetch(`${siteUrl}/api/cron/reminders?key=${encodeURIComponent(cronSecret)}`)
  const data = await response.json()

  console.log('Reminder cron result:', JSON.stringify(data))
}

export const config: Config = {
  schedule: "@hourly"
}
