import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/instant-db";
import { Memo } from "@legendapp/state/react";
import {
  currencies,
  defaultCurrency$,
  type Currency,
} from "@/lib/legend-state";
import { Globe, Moon, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { NativeSelect } from "@/components/ui/native-select";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      {
        title: "Settings | FinFlow",
      },
    ],
  }),
});

export default function SettingsPage() {
  const user = db.useUser();

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Settings" actions={<NavigationDrawer />} />

      <div className="px-4 py-6 space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <div>
                  <Label className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive transaction alerts
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator /> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4" />
                <div>
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle dark theme
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <Separator />
            <div className="flex items-start flex-col gap-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4" />
                <div>
                  <Label className="text-sm font-medium">
                    Default Currency
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Used for calculations and display
                  </p>
                </div>
              </div>
              <Memo>
                {() => (
                  <NativeSelect
                    value={defaultCurrency$.get()}
                    onChange={(e) => {
                      defaultCurrency$.set(e.target.value as Currency);
                    }}
                    className="w-full uppercase"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency.toUpperCase()}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </Memo>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              className="justify-start w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start w-full text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last Updated
              </span>
              <span className="text-sm font-medium">Aug 23, 2025</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                asChild
              >
                <Link to="/privacy">Privacy Policy</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                asChild
              >
                <Link to="/terms">Terms of Service</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                asChild
              >
                <a href="mailto:contact@finflow.com">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
