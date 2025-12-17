import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Trophy, Grid3x3, Loader2, Lock } from "lucide-react";

export default function ProDashboard() {
  const [location, setLocation] = useLocation();
  
  const { data: auth, isLoading: authLoading } = trpc.auth.me.useQuery();
  const { data: subscription, isLoading: subLoading } = trpc.stripe.getSubscription.useQuery(undefined, {
    enabled: !!auth,
  });

  if (authLoading || subLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access Pro Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/api/oauth/callback"} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription?.isPro) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Pro Subscription Required
            </CardTitle>
            <CardDescription>
              Upgrade to Pro to access premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/upgrade")} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen p-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Pro Dashboard
          </h1>
          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
            PRO
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Welcome to your premium features dashboard
        </p>
      </div>

      {/* Pro Features Tabs */}
      <Tabs defaultValue="number-sets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="number-sets" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            เลขชุด
          </TabsTrigger>
          <TabsTrigger value="referral" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            แนะนำเพื่อน
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            กระดานผู้นำ
          </TabsTrigger>
        </TabsList>

        {/* Number Sets Tab */}
        <TabsContent value="number-sets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>เลขชุด (Number Sets)</CardTitle>
              <CardDescription>
                Access curated lottery number sets and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-8 text-center">
                <Grid3x3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Number Sets Feature</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This feature will display curated lottery number sets based on historical data and predictions.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((set) => (
                    <Card key={set} className="p-4">
                      <div className="text-sm text-muted-foreground mb-2">ชุดที่ {set}</div>
                      <div className="text-2xl font-bold">
                        {Math.floor(Math.random() * 90 + 10)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ความแม่นยำ: {Math.floor(Math.random() * 30 + 70)}%
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Tab */}
        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แนะนำเพื่อน (Referral System)</CardTitle>
              <CardDescription>
                Earn rewards by referring friends to join Pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Referral Link */}
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-semibold mb-2">Your Referral Link</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://lottery-lab.com/ref/${auth.id}`}
                      className="flex-1 px-3 py-2 rounded-md bg-background border"
                    />
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`https://lottery-lab.com/ref/${auth.id}`);
                    }}>
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Active Referrals</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">฿0</div>
                    <div className="text-sm text-muted-foreground">Earnings</div>
                  </Card>
                </div>

                {/* Referral List */}
                <div className="rounded-lg bg-muted p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No referrals yet. Share your link to start earning!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>กระดานผู้นำ (Leaderboard)</CardTitle>
              <CardDescription>
                See how you rank against other Pro users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Current User Rank */}
                <Card className="p-4 bg-primary/5 border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">-</div>
                      <div>
                        <div className="font-semibold">{auth.name || "You"}</div>
                        <div className="text-sm text-muted-foreground">Your Rank</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                  </div>
                </Card>

                {/* Top Users */}
                <div className="rounded-lg bg-muted p-8 text-center mt-4">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Leaderboard will be populated as more users join and earn points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-semibold">
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tier</div>
              <div className="font-semibold">Pro</div>
            </div>
            {subscription.subscription?.startDate && (
              <div>
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-semibold">
                  {new Date(subscription.subscription.startDate).toLocaleDateString('th-TH')}
                </div>
              </div>
            )}
            {subscription.subscription?.endDate && (
              <div>
                <div className="text-sm text-muted-foreground">Renews</div>
                <div className="font-semibold">
                  {new Date(subscription.subscription.endDate).toLocaleDateString('th-TH')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
