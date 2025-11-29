"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const email = searchParams.get("email");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setIsValid(false);
        setError("Missing token or email");
        setIsVerifying(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        });

        if (res.ok) {
          setIsValid(true);
        } else {
          const errorText = await res.text();
          setIsValid(false);
          setError(errorText || "Verification failed");
        }
      } catch (error) {
        console.error("Failed to verify email:", error);
        setIsValid(false);
        setError("An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, email]);

  if (isVerifying) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Verifying email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {isValid ? (
            <>
              <CheckCircle2 className="text-green-500 mx-auto size-12" />
              <CardTitle className="text-2xl">Email Verified</CardTitle>
              <CardDescription>
                Your email has been successfully updated to <strong>{email}</strong>
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="text-destructive mx-auto size-12" />
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                {error || "This verification link is invalid or has expired."}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isValid ? (
              <Button className="w-full" onClick={() => router.push("/dashboard/account?tab=account")}>
                Go to Account Settings
              </Button>
            ) : (
              <Button className="w-full" onClick={() => router.push("/login")}>
                Go to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

