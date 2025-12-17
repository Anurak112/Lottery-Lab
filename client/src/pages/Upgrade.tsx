import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Upgrade() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: auth } = trpc.auth.me.useQuery();
  const { data: subscription } = trpc.stripe.getSubscription.useQuery(undefined, {
    enabled: !!auth,
  });
  const createCheckoutMutation = trpc.stripe.createCheckout.useMutation();

  const handleUpgrade = async () => {
    if (!auth) {
      // Redirect to login if not authenticated
      window.location.href = "/api/oauth/callback";
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckoutMutation.mutateAsync();
      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to create checkout:", error);
      setIsLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to upgrade to Pro
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

  if (subscription?.isPro) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              You're Already Pro!
            </CardTitle>
            <CardDescription>
              You have access to all premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/pro")} className="w-full">
              Go to Pro Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Upgrade to Pro</CardTitle>
          <CardDescription>
            Unlock premium features and enhance your lottery experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold">฿99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">เลขชุด (Number Sets)</div>
                  <div className="text-sm text-muted-foreground">
                    Access curated number sets and predictions
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">แนะนำเพื่อน (Referral System)</div>
                  <div className="text-sm text-muted-foreground">
                    Earn rewards by referring friends
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">กระดานผู้นำ (Leaderboard)</div>
                  <div className="text-sm text-muted-foreground">
                    Compete with other users and track your ranking
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Priority Support</div>
                  <div className="text-sm text-muted-foreground">
                    Get faster responses to your questions
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  เริ่มใช้งาน Pro
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Cancel anytime. No hidden fees.</p>
            <p className="mt-1">Test card: 4242 4242 4242 4242</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
