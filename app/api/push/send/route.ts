import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EMPLOYEE_COOKIE_NAME, decodeSessionToken } from '@/lib/employee-auth'
import { sendPushToAll } from '@/lib/send-push'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const payload = decodeSessionToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { title, body, url, tag } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    const sent = await sendPushToAll(title, body, url, tag)

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    console.error('Push send error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
