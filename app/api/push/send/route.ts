import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAll } from '@/lib/send-push'

export async function POST(request: NextRequest) {
  try {
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
