import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'

const VerifySchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = VerifySchema.parse(body)

    // With Clerk, verification is handled through their sign-in flow
    // This endpoint serves as a compatibility layer
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated - use Clerk sign-in flow' },
        { status: 401 }
      )
    }

    // Get user info from Clerk
    const user = await clerkClient.users.getUser(userId)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        full_name: user.fullName || user.firstName || 'User',
      },
    })
  } catch (error) {
    console.error('Verify error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Verification handled by Clerk sign-in flow' },
      { status: 200 }
    )
  }
}
