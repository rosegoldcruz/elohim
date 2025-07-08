import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

export class ClerkAuth {
  async getCurrentUser() {
    try {
      const { userId } = await auth()

      if (!userId) {
        return { user: null, error: 'Not authenticated' }
      }

      const user = await clerkClient.users.getUser(userId)

      return {
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          full_name: user.fullName || user.firstName || 'User',
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        error: null
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return { user: null, error: 'Failed to get user' }
    }
  }

  async validateSession() {
    try {
      const { userId, sessionId } = await auth()

      if (!userId || !sessionId) {
        return { valid: false, error: 'No active session' }
      }

      const user = await clerkClient.users.getUser(userId)

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          full_name: user.fullName || user.firstName || 'User',
        },
        sessionId,
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return { valid: false, error: 'Failed to validate session' }
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await clerkClient.users.getUser(userId)

      return {
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          full_name: user.fullName || user.firstName || 'User',
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        error: null
      }
    } catch (error) {
      console.error('Error getting user by ID:', error)
      return { user: null, error: 'User not found' }
    }
  }

  async createInvitation(email: string, redirectUrl?: string) {
    try {
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/studio`,
      })

      return { success: true, invitation }
    } catch (error) {
      console.error('Error creating invitation:', error)
      return { success: false, error: 'Failed to create invitation' }
    }
  }
}

// Export singleton instance
export const clerkAuth = new ClerkAuth()

// Helper functions for Next.js API routes (compatibility layer)
export async function getCurrentUser() {
  return clerkAuth.getCurrentUser()
}

export async function validateUserSession() {
  return clerkAuth.validateSession()
}

export async function getUserById(userId: string) {
  return clerkAuth.getUserById(userId)
}

export async function sendMagicLinkEmail(email: string, redirectTo?: string) {
  // Magic links are handled by Clerk's sign-in flow
  return { success: true, message: 'Use Clerk sign-in flow for magic links' }
}

export async function verifyMagicLinkToken(token: string, email: string) {
  // Verification is handled by Clerk
  return { success: false, error: 'Use Clerk sign-in flow for verification' }
}

export async function logoutUser(sessionToken?: string) {
  // Logout is handled by Clerk client-side
  return { success: true, message: 'Use Clerk signOut() client-side' }
}
