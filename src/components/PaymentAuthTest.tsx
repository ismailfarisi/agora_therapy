"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PaymentAuthTest() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testPaymentAuth = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Simulate a minimal Stripe API call with test data
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer test-token", // Using a test token for now
        },
        body: JSON.stringify({
          therapistId: "test-therapist",
          therapistName: "Test Therapist",
          therapistEmail: "therapist@test.com",
          appointmentDate: "2024-01-15",
          appointmentTime: "10:00 AM",
          duration: 60,
          amount: 50, // $50 minimum for testing
          currency: "usd",
          clientName: "Test Client",
          clientEmail: "client@test.com",
          notes: "Test payment authorization",
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ SUCCESS: Authorization header accepted. Session ID: ${data.sessionId}`);
      } else {
        setResult(`❌ ERROR (${response.status}): ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setResult(`❌ NETWORK ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Authorization Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testPaymentAuth} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Payment Auth"}
        </Button>
        
        {result && (
          <Alert variant={result.includes("✅") ? "default" : "destructive"}>
            <AlertDescription className="whitespace-pre-wrap">
              {result}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}