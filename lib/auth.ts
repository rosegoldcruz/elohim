import { supabaseAdmin } from './supabase'
import { sendEmail } from './email'
import { env } from '../env.mjs'
import { randomBytes } from 'crypto'

interface MagicLinkToken {
  id: string
  email: string
  token: string
  expires_at: string
  used: boolean
  created_at: string
}

export class MagicLinkAuth {
  private tokenExpiryMinutes = 15 // Magic links expire in 15 minutes

  async sendMagicLink(email: string, redirectTo?: string) {
    try {
      // Generate secure token
      const token = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + this.tokenExpiryMinutes * 60 * 1000)

      // Store token in database
      const { error: tokenError } = await supabaseAdmin
        .from('magic_link_tokens')
        .insert({
          email,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
        })

      if (tokenError) {
        console.error('Error storing magic link token:', tokenError)
        throw new Error('Failed to generate magic link')
      }

      // Create magic link URL
      const baseUrl = env.NEXT_PUBLIC_APP_URL
      const magicLinkUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`
      
      if (redirectTo) {
        magicLinkUrl += `&redirect=${encodeURIComponent(redirectTo)}`
      }

      // Send email with magic link
      await sendEmail(
        {
          to_email: email,
          to_name: email.split('@')[0],
          subject: 'Your AEON Magic Link',
          message: `Click the link below to access your AEON account:\n\n${magicLinkUrl}\n\nThis link expires in ${this.tokenExpiryMinutes} minutes.`,
          magic_link: magicLinkUrl,
        },
        'magic_link_template'
      )

      return { success: true, message: 'Magic link sent to your email' }
    } catch (error) {
      console.error('Error sending magic link:', error)
      throw new Error('Failed to send magic link')
    }
  }

  async verifyMagicLink(token: string, email: string) {
    try {
      // Find and validate token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('magic_link_tokens')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('used', false)
        .single()

      if (tokenError || !tokenData) {
        return { success: false, error: 'Invalid or expired magic link' }
      }

      // Check if token is expired
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      
      if (now > expiresAt) {
        return { success: false, error: 'Magic link has expired' }
      }

      // Mark token as used
      await supabaseAdmin
        .from('magic_link_tokens')
        .update({ used: true })
        .eq('id', tokenData.id)

      // Get or create user
      let user = await this.getOrCreateUser(email)

      // Generate session token
      const sessionToken = this.generateSecureToken()
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      // Store session
      const { error: sessionError } = await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          token: sessionToken,
          expires_at: sessionExpiresAt.toISOString(),
          ip_address: null, // Would be set from request
          user_agent: null, // Would be set from request
        })

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        throw new Error('Failed to create session')
      }

      return {
        success: true,
        user,
        sessionToken,
        expiresAt: sessionExpiresAt,
      }
    } catch (error) {
      console.error('Error verifying magic link:', error)
      return { success: false, error: 'Failed to verify magic link' }
    }
  }

  async validateSession(sessionToken: string) {
    try {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('token', sessionToken)
        .eq('is_active', true)
        .single()

      if (sessionError || !session) {
        return { valid: false, error: 'Invalid session' }
      }

      // Check if session is expired
      const now = new Date()
      const expiresAt = new Date(session.expires_at)
      
      if (now > expiresAt) {
        // Mark session as inactive
        await supabaseAdmin
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', session.id)

        return { valid: false, error: 'Session expired' }
      }

      // Update last accessed
      await supabaseAdmin
        .from('user_sessions')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', session.id)

      return {
        valid: true,
        user: session.users,
        session,
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return { valid: false, error: 'Failed to validate session' }
    }
  }

  async logout(sessionToken: string) {
    try {
      await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('token', sessionToken)

      return { success: true }
    } catch (error) {
      console.error('Error logging out:', error)
      return { success: false, error: 'Failed to logout' }
    }
  }

  private async getOrCreateUser(email: string) {
    // Try to find existing user
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        full_name: email.split('@')[0],
        credits: 0,
        subscription_tier: 'free',
        subscription_status: 'inactive',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      throw new Error('Failed to create user')
    }

    return newUser
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex')
  }
}

// Export singleton instance
export const magicLinkAuth = new MagicLinkAuth()

// Helper functions for Next.js API routes
export async function sendMagicLinkEmail(email: string, redirectTo?: string) {
  return magicLinkAuth.sendMagicLink(email, redirectTo)
}

export async function verifyMagicLinkToken(token: string, email: string) {
  return magicLinkAuth.verifyMagicLink(token, email)
}

export async function validateUserSession(sessionToken: string) {
  return magicLinkAuth.validateSession(sessionToken)
}

export async function logoutUser(sessionToken: string) {
  return magicLinkAuth.logout(sessionToken)
}
