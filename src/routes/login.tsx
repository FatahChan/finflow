import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { db } from "@/lib/instant-db";
import { GoogleLoginButton } from "@/components/google-login";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const user = await db.getAuth();
    if (user) {
      throw redirect({ to: "/dashboard/home" });
    }
  },
  component: LoginPage,
  ssr: false,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to FinFlow
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Sign in to manage your accounts and transactions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <span className="flex items-center justify-center">
            <GoogleLoginButton />
          </span>
          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>
              By signing in, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary hover:text-primary/80 underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80 underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
