import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Export user data as CSV for marketing campaigns
 * GET /api/admin/export-users
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminUsers.includes(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const marketingOnly = searchParams.get('marketing_only') === 'true'

    // Fetch user data
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        full_name,
        birthday,
        marketing_consent,
        subscription_tier,
        subscription_status,
        credits,
        login_count,
        last_login_at,
        created_at
      `)

    // Filter for marketing consent if requested
    if (marketingOnly) {
      query = query.eq('marketing_consent', true)
    }

    const { data: users, error: usersError } = await query.order('created_at', { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Email',
        'First Name',
        'Last Name',
        'Full Name',
        'Birthday',
        'Age',
        'Marketing Consent',
        'Subscription Tier',
        'Subscription Status',
        'Credits',
        'Login Count',
        'Last Login',
        'Signup Date',
        'Days Since Signup'
      ]

      const csvRows = users?.map(user => {
        const birthday = user.birthday ? new Date(user.birthday) : null
        const age = birthday ? Math.floor((Date.now() - birthday.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
        const signupDate = new Date(user.created_at)
        const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (24 * 60 * 60 * 1000))

        return [
          user.id,
          user.email,
          user.first_name || '',
          user.last_name || '',
          user.full_name || '',
          birthday ? birthday.toISOString().split('T')[0] : '',
          age || '',
          user.marketing_consent ? 'Yes' : 'No',
          user.subscription_tier || '',
          user.subscription_status || '',
          user.credits || 0,
          user.login_count || 0,
          user.last_login_at ? new Date(user.last_login_at).toISOString() : '',
          signupDate.toISOString(),
          daysSinceSignup
        ]
      }) || []

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      const filename = marketingOnly 
        ? `aeon-marketing-users-${new Date().toISOString().split('T')[0]}.csv`
        : `aeon-all-users-${new Date().toISOString().split('T')[0]}.csv`

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      users: users?.map(user => ({
        ...user,
        age: user.birthday ? Math.floor((Date.now() - new Date(user.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        days_since_signup: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (24 * 60 * 60 * 1000))
      })),
      total: users?.length || 0,
      marketing_opted_in: users?.filter(u => u.marketing_consent).length || 0,
      exported_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Export users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get user analytics summary
 * POST /api/admin/export-users (with analytics: true)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminUsers.includes(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    if (body.analytics) {
      // Get detailed analytics
      const { data: users } = await supabase
        .from('users')
        .select('birthday, marketing_consent, subscription_tier, created_at, login_count')

      const now = new Date()
      const analytics = {
        total_users: users?.length || 0,
        marketing_opted_in: users?.filter(u => u.marketing_consent).length || 0,
        paid_users: users?.filter(u => u.subscription_tier !== 'free_trial').length || 0,
        age_groups: {},
        signup_trends: {},
        engagement_stats: {
          avg_logins: users?.reduce((sum, u) => sum + (u.login_count || 0), 0) / (users?.length || 1),
          active_users: users?.filter(u => u.login_count > 0).length || 0
        }
      }

      // Calculate age groups
      users?.forEach(user => {
        if (user.birthday) {
          const age = Math.floor((now.getTime() - new Date(user.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          let ageGroup = '65+'
          if (age < 18) ageGroup = 'Under 18'
          else if (age <= 24) ageGroup = '18-24'
          else if (age <= 34) ageGroup = '25-34'
          else if (age <= 44) ageGroup = '35-44'
          else if (age <= 54) ageGroup = '45-54'
          else if (age <= 64) ageGroup = '55-64'
          
          analytics.age_groups[ageGroup] = (analytics.age_groups[ageGroup] || 0) + 1
        }
      })

      // Calculate signup trends (last 30 days)
      users?.forEach(user => {
        const signupDate = new Date(user.created_at)
        const daysDiff = Math.floor((now.getTime() - signupDate.getTime()) / (24 * 60 * 60 * 1000))
        if (daysDiff <= 30) {
          const dateKey = signupDate.toISOString().split('T')[0]
          analytics.signup_trends[dateKey] = (analytics.signup_trends[dateKey] || 0) + 1
        }
      })

      return NextResponse.json(analytics)
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
