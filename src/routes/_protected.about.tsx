import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, Code, Shield } from "lucide-react";

export const Route = createFileRoute("/_protected/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: "About | FinFlow",
      },
    ],
  }),
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="About" actions={<NavigationDrawer />} />
      
      <div className="px-4 py-6 space-y-6">
        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              FinFlow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              FinFlow is a modern personal finance management app built to help you track your expenses, 
              manage accounts, and gain insights into your financial health.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Multi-account transaction tracking</li>
              <li>• Real-time currency conversion</li>
              <li>• Category-based expense organization</li>
              <li>• Secure authentication</li>
              <li>• Responsive design for all devices</li>
            </ul>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Built With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• React & TypeScript</li>
              <li>• TanStack Router</li>
              <li>• InstantDB for real-time data</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Vite for development</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your financial data is encrypted and stored securely. We never share your personal 
              information with third parties without your consent.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Need help? Have feedback? We'd love to hear from you.
            </p>
            <Button variant="outline" size="sm" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
