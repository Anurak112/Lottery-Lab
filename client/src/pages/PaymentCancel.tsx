import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  const [location, setLocation] = useLocation();

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <XCircle className="h-6 w-6" />
            Payment Cancelled
          </CardTitle>
          <CardDescription>
            Your payment was cancelled. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              You can try again anytime to upgrade to Pro and get access to premium features.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/upgrade")} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
