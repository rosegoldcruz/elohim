import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLinkEmail } from '@/lib/auth'
import { z } from 'zod'

const MagicLinkSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, redirectTo } = MagicLinkSchema.parse(body)

    const result = await sendMagicLinkEmail(email, redirectTo)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Magic link error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
