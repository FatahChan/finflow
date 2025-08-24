import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useReactPWAInstall } from "./pwa-install";
import { useCallback } from "react";
import { toast } from "sonner";

function ReloadPrompt() {
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

  return (
    <AlertDialog defaultOpen={supported() && !isInstalled()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>App ready to work offline</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleInstall()}>
            Install
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ReloadPrompt;
