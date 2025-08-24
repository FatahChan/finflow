import { useRegisterSW } from "virtual:pwa-register/react";
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
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

function ReloadPrompt() {
  const { pwaInstall, supported, isInstalled, isCaptured } =
    useReactPWAInstall();

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
    onOfflineReady() {
      setOfflineReady(true);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

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

  useEffect(() => {
    console.log("offlineReady", offlineReady);
    console.log("needRefresh", needRefresh);
    console.log("isCaptured", isCaptured);
  }, [offlineReady, needRefresh, isCaptured]);

  return (
    <AlertDialog open={offlineReady || needRefresh || isCaptured}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {offlineReady
              ? "App ready to work offline"
              : "New content available"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
          {needRefresh ? (
            <AlertDialogAction onClick={() => updateServiceWorker(true)}>
              Reload
            </AlertDialogAction>
          ) : offlineReady && !isInstalled() && supported() ? (
            <AlertDialogAction onClick={() => handleInstall()}>
              Install
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ReloadPrompt;
