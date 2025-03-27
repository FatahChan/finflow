import { useLogout } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { AlignJustify, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

function HamburgerMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: logout } = useLogout();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn("fixed top-1 left-1", className)} asChild>
        <Button variant={"ghost"}>
          <span className="sr-only">Toggle menu</span>
          {open ? <X /> : <AlignJustify />}
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-grow flex-col gap-2 p-4">
          <Button onClick={() => logout()} className="mt-auto">
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HamburgerMenu;
