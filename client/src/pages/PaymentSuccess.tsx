import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const completeCheckoutMutation = trpc.stripe.completeCheckout.useMutation();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("Invalid payment session");
      setIsProcessing(false);
      return;
    }

    // Complete the checkout process
    completeCheckoutMutation.mutate(
      { sessionId },
      {
        onSuccess: (data) => {
          setIsProcessing(false);
          
          // Start countdown to redirect to Pro Dashboard
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                // Redirect to Pro Dashboard
                setLocation("/pro");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        },
        onError: (error) => {
          setError(error.message || "Failed to process payment");
          setIsProcessing(false);
        },
      }
    );
  }, [searchParams]);

  if (error) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/upgrade")} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Payment...
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your subscription
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your Pro subscription has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2">Welcome to Pro! 🎉</h3>
            <p className="text-sm text-muted-foreground">
              You now have access to all premium features including:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• เลขชุด (Number Sets)</li>
              <li>• แนะนำเพื่อน (Referral System)</li>
              <li>• กระดานผู้นำ (Leaderboard)</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Redirecting to Pro Dashboard in {countdown} seconds...
            </p>
            <Button onClick={() => setLocation("/pro")} className="w-full">
              Go to Pro Dashboard Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
