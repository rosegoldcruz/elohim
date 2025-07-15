import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const user = {
  email: "daniel.cruz@aeon.os",
  plan: "Pro Plan",
  renews: "July 22, 2025",
  creditsUsed: 35,
  creditsTotal: 50,
}

const creditUsagePercentage = (user.creditsUsed / user.creditsTotal) * 100

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-400">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Current Plan</p>
              <p className="font-medium">{user.plan}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Next Renewal</p>
              <p className="font-medium">{user.renews}</p>
            </div>
            <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-900/50">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{user.creditsTotal - user.creditsUsed}</p>
              <p className="text-neutral-400">credits remaining</p>
            </div>
            <div>
              <Progress value={creditUsagePercentage} className="w-full [&>*]:bg-purple-500" />
              <p className="text-sm text-neutral-500 mt-2 text-right">
                {user.creditsUsed} / {user.creditsTotal} used
              </p>
            </div>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">Buy More Credits</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
