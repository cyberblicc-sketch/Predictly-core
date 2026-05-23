import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, category, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Name, email, subject, and message are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long' }, { status: 400 })
    }

    // Create contact message
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        category: category || 'general',
        status: 'new',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We\'ll get back to you within 24 hours.',
      id: contactMessage.id,
    })
  } catch (error) {
    console.error('[Contact] Error:', error)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
