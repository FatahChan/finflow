import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  ssr: false,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                FinFlow
              </span>
            </div>
            <Link to="/login">
              <Button variant="outline" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Take Control of Your
            <span className="text-primary block">Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            FinFlow helps you track expenses, manage accounts, and make smarter
            financial decisions with real-time insights and intelligent
            analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage your money
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to simplify your financial life and
              help you achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/80 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Smart Analytics</CardTitle>
                <CardDescription>
                  Get detailed insights into your spending patterns with
                  interactive charts and reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/80 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Account Management</CardTitle>
                <CardDescription>
                  Connect and manage multiple bank accounts, credit cards, and
                  investment accounts in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/80 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Goal Tracking</CardTitle>
                <CardDescription>
                  Set financial goals and track your progress with personalized
                  recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-destructive/80 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive-foreground" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription>
                  Your financial data is encrypted and kept private with modern
                  security practices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/80 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Mobile First</CardTitle>
                <CardDescription>
                  Access your finances anywhere with our responsive web app that
                  works on all devices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/80 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Real-time Sync</CardTitle>
                <CardDescription>
                  Your data syncs instantly across all devices so you're always
                  up to date.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why choose FinFlow?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Easy to Use
                    </h3>
                    <p className="text-muted-foreground">
                      Intuitive interface designed for everyone, from beginners
                      to financial experts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Completely Free
                    </h3>
                    <p className="text-muted-foreground">
                      No hidden fees, no premium tiers. All features are
                      available to everyone.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Privacy First
                    </h3>
                    <p className="text-muted-foreground">
                      Your financial data stays private and secure. We never
                      sell your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-primary-foreground">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm opacity-90">4.9/5 rating</span>
                </div>
                <blockquote className="text-lg mb-4">
                  "FinFlow has completely transformed how I manage my finances.
                  The insights are incredible and it's so easy to use!"
                </blockquote>
                <cite className="text-sm opacity-90">
                  — Sarah, Personal Trainer
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of users who have already transformed their financial
            lives with FinFlow.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  FinFlow
                </span>
              </div>
              <p className="text-sm">
                Making financial management simple and accessible for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 FinFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
