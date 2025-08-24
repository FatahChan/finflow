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

export function NavigationDrawer() {
  const navigate = useNavigate();
  const user = db.useUser();
  const { data } = db.useQuery({
    profiles: {
      $: {
        where: {
          "user.id": user?.id,
        },
      },
    },
  });

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
            <SheetDescription>{user?.email}</SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex flex-col space-y-4 py-6">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate({ to: "/dashboard/settings" })}
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate({ to: "/about" })}
          >
            About
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate({ to: "/privacy" })}
          >
            Privacy Policy
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate({ to: "/terms" })}
          >
            Terms of Service
          </Button>
        </div>

        <SheetFooter>
          <Button
            variant={"destructive"}
            onClick={() => {
              db.auth.signOut().then(() => {
                navigate({ to: "/login" });
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
