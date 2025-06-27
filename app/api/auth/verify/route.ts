import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLinkToken } from '@/lib/auth'
import { z } from 'zod'

const VerifySchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = VerifySchema.parse(body)

    const result = await verifyMagicLinkToken(token, email)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    response.cookies.set('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify magic link error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify magic link' },
      { status: 500 }
    )
  }
}
