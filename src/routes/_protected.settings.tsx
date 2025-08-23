import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { NativeSelect } from "@/components/ui/native-select";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsOnline } from "react-use-is-online";
import { deleteUser } from "@/actions/delete-user";
import { toast } from "sonner";

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

  const { theme, setTheme } = useTheme();

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
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
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
            <ExportButton />
            <DeleteAllDataButton />
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function DeleteAllDataButton({ ...props }: ComponentProps<typeof Button>) {
  const auth = db.useAuth();
  const { isOnline } = useIsOnline();
  const navigate = useNavigate();
  const refreshToken = auth.user?.refresh_token;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="justify-start w-full text-destructive hover:text-destructive"
          {...props}
          disabled={!isOnline || !refreshToken}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All Data{" "}
          {!isOnline
            ? "(You are offline)"
            : !refreshToken
            ? "(Please re-login to delete your data)"
            : ""}
        </Button>
      </AlertDialogTrigger>
      {isOnline && refreshToken ? (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteUser({
                  data: refreshToken,
                })
                  .then(async () => {
                    await db.auth.signOut();
                    navigate({ to: "/login" });
                  })
                  .catch((err) => {
                    toast.error(err.message);
                  });
              }}
              variant="destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}
function ExportButton({ onClick, ...props }: ComponentProps<typeof Button>) {
  const { data } = db.useQuery({
    accounts: {
      transactions: {},
    },
  });
  return (
    <Button
      variant="outline"
      size="sm"
      className="justify-start w-full"
      onClick={(e) => {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        a.click();
        URL.revokeObjectURL(url);
        onClick?.(e);
      }}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  );
}
