import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { STRIPE_PLANS } from '@/lib/stripe'
import { CheckoutButton } from '@/components/checkout-button'
import { CreditCard, Zap, Calendar, TrendingUp } from 'lucide-react'

export default async function BillingPage() {
  const session = await requireAuth()
  const supabase = await createClient()

  // Get user profile with subscription info
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      user_subscriptions (
        status,
        price_id,
        current_period_start,
        current_period_end,
        stripe_subscription_id
      )
    `)
    .eq('id', session.user.id)
    .single()

  // Get recent credit transactions
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const credits = profile?.credits || 0
  const subscription = profile?.user_subscriptions?.[0]
  const subscriptionTier = profile?.subscription_tier || 'free'

  // Calculate usage this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthlyUsage } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', session.user.id)
    .eq('transaction_type', 'debit')
    .gte('created_at', startOfMonth.toISOString())

  const creditsUsedThisMonth = monthlyUsage?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Billing & Credits</h1>
        <p className="text-neutral-400">
          Manage your subscription and monitor credit usage
        </p>
      </div>

      {/* Current Plan & Credits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Available Credits
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{credits}</div>
            <p className="text-xs text-neutral-400 mt-2">
              1 credit = 1 second of video
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Current Plan
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">{subscriptionTier}</div>
            <Badge variant="outline" className="mt-2 text-xs">
              {subscription?.status || 'Free'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Usage This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{creditsUsedThisMonth}</div>
            <p className="text-xs text-neutral-400 mt-2">
              Credits used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Upgrade Your Plan</CardTitle>
          <CardDescription>
            Get more credits and unlock advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(STRIPE_PLANS).map(([key, plan]) => (
              <div key={key} className="border border-white/10 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  {plan.oneTime && (
                    <div className="text-2xl font-bold text-white">
                      ${plan.oneTime.price}
                    </div>
                  )}
                  {plan.monthly && (
                    <div className="text-2xl font-bold text-white">
                      ${plan.monthly.price}/mo
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-neutral-400">
                  {plan.oneTime && (
                    <p>{plan.oneTime.credits} credits</p>
                  )}
                  {plan.monthly && (
                    <p>{plan.monthly.credits} credits/month</p>
                  )}
                  {plan.yearly && (
                    <p className="text-green-400">
                      Save with yearly: ${plan.yearly.price}/year
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {plan.monthly && (
                    <CheckoutButton
                      priceId={plan.monthly.priceId}
                      className="w-full"
                      disabled={subscription?.price_id === plan.monthly.priceId}
                    >
                      {subscription?.price_id === plan.monthly.priceId ? 'Current Plan' : 'Subscribe Monthly'}
                    </CheckoutButton>
                  )}
                  {plan.yearly && (
                    <CheckoutButton
                      priceId={plan.yearly.priceId}
                      variant="outline"
                      className="w-full"
                      disabled={subscription?.price_id === plan.yearly.priceId}
                    >
                      {subscription?.price_id === plan.yearly.priceId ? 'Current Plan' : 'Subscribe Yearly'}
                    </CheckoutButton>
                  )}
                  {plan.oneTime && (
                    <CheckoutButton
                      priceId={plan.oneTime.priceId}
                      className="w-full"
                    >
                      Buy Credits
                    </CheckoutButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription>
            Your credit transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-sm text-neutral-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold ${transaction.transaction_type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.transaction_type === 'credit' ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-center py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details */}
      {subscription && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Subscription Details</CardTitle>
            <CardDescription>
              Manage your current subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-400">Status</p>
                <Badge variant="outline" className="mt-1">
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Next Billing</p>
                <p className="text-white">
                  {subscription.current_period_end ? 
                    new Date(subscription.current_period_end).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
