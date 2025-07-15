import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserProfileForm } from '@/components/user-profile-form'
import { SignOutButton } from '@/components/sign-out-button'

export default async function SettingsPage() {
  const session = await requireAuth()
  const supabase = await createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-neutral-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfileForm user={profile} />
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Account Actions</CardTitle>
          <CardDescription>
            Manage your account and session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Sign Out</h3>
              <p className="text-sm text-neutral-400">
                Sign out of your account on this device
              </p>
            </div>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Preferences</CardTitle>
          <CardDescription>
            Customize your AEON experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Video Quality</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Choose your default video quality settings
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium">720p</h4>
                  <p className="text-xs text-neutral-400">Good quality, faster processing</p>
                </div>
                <div className="p-3 border border-purple-500/50 bg-purple-500/10 rounded-lg">
                  <h4 className="text-white font-medium">1080p</h4>
                  <p className="text-xs text-neutral-400">High quality (recommended)</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium">4K</h4>
                  <p className="text-xs text-neutral-400">Ultra quality, slower processing</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Default Style</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Your preferred video style for new projects
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-purple-500/50 bg-purple-500/10 rounded-lg">
                  <h4 className="text-white font-medium">Viral</h4>
                  <p className="text-xs text-neutral-400">TikTok-style editing</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="text-white font-medium">Cinematic</h4>
                  <p className="text-xs text-neutral-400">Professional look</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
