import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { db } from "@/lib/instant-db";
import { useNavigate } from "@tanstack/react-router";
import { AlignJustify } from "lucide-react";
import { AvatarImage, Avatar, AvatarFallback } from "./ui/avatar";
import { useReactPWAInstall } from "./pwa-install";
import { toast } from "sonner";
import { useCallback } from "react";

export function NavigationDrawer() {
  const navigate = useNavigate();
  const user = db.useUser();
  const { data } = db.useQuery({
    profiles: {
      $: {
        where: {
          "user.id": user.id,
        },
      },
    },
  });
  const { pwaInstall, supported, isInstalled } = useReactPWAInstall();

  const handleInstall = useCallback(() => {
    pwaInstall({
      title: "Install FinFlow",
      logo: "/pwa-512x512.png",
      features: (
        <ul>
          <li>Tracks your expenses</li>
          <li>Manages your accounts</li>
          <li>Works offline</li>
        </ul>
      ),
      description:
        "A financial management app that helps you manage your money.",
    })
      .then(() =>
        toast.success(
          "App installed successfully or instructions for install shown"
        )
      )
      .catch(() => toast.error("User opted out from installing"));
  }, [pwaInstall]);
  const profile = data?.profiles.at(0);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <AlignJustify />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center">
          <Avatar>
            <AvatarImage src={profile?.picture} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="w-fit">
            <SheetTitle>{profile?.name}</SheetTitle>
            <SheetDescription>{user.email}</SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex flex-col space-y-4">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() =>{void navigate({ to: "/dashboard/settings" })}}
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() =>{void navigate({ to: "/about" })}}
          >
            About
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() =>{void navigate({ to: "/privacy" })}}
          >
            Privacy Policy
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() =>{void navigate({ to: "/terms" })}}
          >
            Terms of Service
          </Button>
          {supported() && !isInstalled() ? (
            <Button
              className="justify-start"
              variant={"secondary"}
              onClick={() => { handleInstall(); }}
            >
              Install
            </Button>
          ) : null}
        </div>

        <SheetFooter>
          <Button
            variant={"destructive"}
            onClick={() => {
              void db.auth.signOut().then(() => {
                void navigate({ to: "/login" });
              });
            }}
          >
            Logout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
