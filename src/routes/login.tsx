import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { db } from "@/lib/instant-db";
import { GoogleLoginButton } from "@/components/google-login";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const user = await db.getAuth();
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
  ssr: false,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Finance Manager
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sign in to manage your accounts and transactions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <span className="flex items-center justify-center">
            <GoogleLoginButton />
          </span>
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>
              By signing in, you agree to our{" "}
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
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
