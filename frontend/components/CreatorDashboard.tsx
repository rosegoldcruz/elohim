'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet, 
  CreditCard, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Settings,
  ExternalLink,
  Copy,
  Loader2,
  DollarSign,
  Bitcoin
} from 'lucide-react'
import { toast } from 'sonner'

interface CreatorWallet {
  id: string
  creator_id: string
  balance: number
  pending_payouts: number
  total_earnings: number
  total_payouts: number
  payout_method: 'stripe' | 'crypto' | 'bank'
  payout_threshold: number
  auto_payout: boolean
  stripe_account_id?: string
  stripe_account_status?: string
  crypto_wallet_address?: string
  crypto_wallet_type?: string
}

interface CreatorTransaction {
  id: string
  type: 'earning' | 'payout' | 'bonus' | 'refund' | 'fee'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payout_method?: string
  transaction_hash?: string
  stripe_transfer_id?: string
  created_at: string
}

interface WalletSummary {
  wallet: CreatorWallet | null
  recentTransactions: CreatorTransaction[]
  monthlyEarnings: number
  totalVideosCreated: number
  averageEarningsPerVideo: number
}

interface CreatorDashboardProps {
  creatorId?: string
}

export default function CreatorDashboard({ creatorId }: CreatorDashboardProps) {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [cryptoToken, setCryptoToken] = useState<'ETH' | 'USDC'>('USDC')

  // Settings state
  const [payoutThreshold, setPayoutThreshold] = useState(10)
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false)
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('')

  useEffect(() => {
    fetchWalletData()
  }, [creatorId])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = creatorId ? `?creatorId=${creatorId}` : ''
      const response = await fetch(`/api/creator/wallet${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data')
      }

      const result = await response.json()
      setWalletSummary(result.data)

      // Update settings from wallet data
      if (result.data.wallet) {
        setPayoutThreshold(result.data.wallet.payout_threshold)
        setAutoPayoutEnabled(result.data.wallet.auto_payout)
        setCryptoWalletAddress(result.data.wallet.crypto_wallet_address || '')
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const handleStripePayout = async () => {
    if (!payoutAmount || !walletSummary?.wallet) return

    const amount = parseFloat(payoutAmount)
    if (amount <= 0 || amount > walletSummary.wallet.balance) {
      toast.error('Invalid payout amount')
      return
    }

    try {
      setPayoutLoading(true)

      const response = await fetch('/api/creator/payout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payout failed')
      }

      toast.success(`Stripe payout of ${amount} credits initiated successfully!`)
      setPayoutAmount('')
      await fetchWalletData() // Refresh data

    } catch (error) {
      console.error('Stripe payout error:', error)
      toast.error(error instanceof Error ? error.message : 'Payout failed')
    } finally {
      setPayoutLoading(false)
    }
  }

  const handleCryptoPayout = async () => {
    if (!payoutAmount || !walletSummary?.wallet) return

    const amount = parseFloat(payoutAmount)
    if (amount <= 0 || amount > walletSummary.wallet.balance) {
      toast.error('Invalid payout amount')
      return
    }

    try {
      setPayoutLoading(true)

      const response = await fetch('/api/creator/payout/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, tokenType: cryptoToken })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Crypto payout failed')
      }

      toast.success(`${cryptoToken} payout of ${amount} credits initiated successfully!`)
      setPayoutAmount('')
      await fetchWalletData() // Refresh data

    } catch (error) {
      console.error('Crypto payout error:', error)
      toast.error(error instanceof Error ? error.message : 'Crypto payout failed')
    } finally {
      setPayoutLoading(false)
    }
  }

  const updatePayoutSettings = async () => {
    try {
      const response = await fetch('/api/creator/wallet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_threshold: payoutThreshold,
          auto_payout: autoPayoutEnabled,
          crypto_wallet_address: cryptoWalletAddress
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      toast.success('Payout settings updated successfully!')
      await fetchWalletData()

    } catch (error) {
      console.error('Settings update error:', error)
      toast.error('Failed to update settings')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount * 0.01) // Assuming 1 credit = $0.01
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earning': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'payout': return <Download className="h-4 w-4 text-blue-500" />
      case 'bonus': return <CheckCircle className="h-4 w-4 text-purple-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading creator dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!walletSummary?.wallet) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Creator wallet not found</AlertDescription>
      </Alert>
    )
  }

  const { wallet, recentTransactions, monthlyEarnings } = walletSummary

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Creator Dashboard
        </h1>
        <p className="text-neutral-400 mt-2">Manage your earnings and payouts</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-green-500" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {wallet.balance} credits
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {formatCurrency(wallet.balance)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {monthlyEarnings} credits
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {formatCurrency(monthlyEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-purple-500" />
              Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {wallet.total_payouts} credits
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {formatCurrency(wallet.total_payouts)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="payouts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stripe Payout */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  Stripe Payout
                </CardTitle>
                <CardDescription>
                  Withdraw to your bank account via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-amount">Amount (credits)</Label>
                  <Input
                    id="stripe-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={wallet.balance}
                    min={wallet.payout_threshold}
                  />
                  <div className="text-xs text-neutral-400">
                    Min: {wallet.payout_threshold} credits • Max: {wallet.balance} credits
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Stripe Status:</span>
                  <Badge variant={wallet.stripe_account_status === 'active' ? 'default' : 'secondary'}>
                    {wallet.stripe_account_status || 'Not Connected'}
                  </Badge>
                </div>

                <Button
                  onClick={handleStripePayout}
                  disabled={payoutLoading || !wallet.stripe_account_id || !payoutAmount}
                  className="w-full"
                >
                  {payoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Payout to Bank
                </Button>

                {!wallet.stripe_account_id && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connect your Stripe account to enable bank payouts
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Crypto Payout */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5 text-orange-500" />
                  Crypto Payout
                </CardTitle>
                <CardDescription>
                  Withdraw to your crypto wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crypto-amount">Amount (credits)</Label>
                  <Input
                    id="crypto-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={wallet.balance}
                    min={wallet.payout_threshold}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Token Type</Label>
                  <Select value={cryptoToken} onValueChange={(value: 'ETH' | 'USDC') => setCryptoToken(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC (Recommended)</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Wallet Status:</span>
                  <Badge variant={wallet.crypto_wallet_address ? 'default' : 'secondary'}>
                    {wallet.crypto_wallet_address ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>

                <Button
                  onClick={handleCryptoPayout}
                  disabled={payoutLoading || !wallet.crypto_wallet_address || !payoutAmount}
                  className="w-full"
                >
                  {payoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Bitcoin className="h-4 w-4 mr-2" />
                  )}
                  Payout to Crypto
                </Button>

                {!wallet.crypto_wallet_address && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connect your crypto wallet in settings to enable crypto payouts
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Your latest earnings and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    No transactions yet
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-neutral-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                          <span className="text-xs text-neutral-400 capitalize">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payout Settings
              </CardTitle>
              <CardDescription>
                Configure your payout preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="threshold">Minimum Payout Threshold (credits)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={payoutThreshold}
                  onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                  min={1}
                  max={1000}
                />
                <div className="text-xs text-neutral-400">
                  Minimum amount required to trigger a payout
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Payout</Label>
                  <div className="text-sm text-neutral-400">
                    Automatically payout when threshold is reached
                  </div>
                </div>
                <Switch
                  checked={autoPayoutEnabled}
                  onCheckedChange={setAutoPayoutEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="crypto-wallet">Crypto Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="crypto-wallet"
                    placeholder="0x..."
                    value={cryptoWalletAddress}
                    onChange={(e) => setCryptoWalletAddress(e.target.value)}
                  />
                  {cryptoWalletAddress && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(cryptoWalletAddress)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  Ethereum address for crypto payouts
                </div>
              </div>

              <Button onClick={updatePayoutSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
