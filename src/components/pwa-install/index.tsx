import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from "react";
import { platforms, getPlatform } from "@/lib/get-platform";
import InstallDialog from "./install-dialog";

interface PWAInstallOptions {
  title?: string;
  logo?: string;
  features?: ReactNode;
  description?: ReactNode;
}

interface PWAInstallContextValue {
  supported: () => boolean;
  isInstalled: () => boolean;
  pwaInstall: (options?: PWAInstallOptions) => Promise<void>;
}

interface AwaitingPromise {
  resolve: () => void;
  reject: () => void;
}

const ReactPWAInstallContext = createContext<PWAInstallContextValue>({
  supported: () => false,
  isInstalled: () => false,
  pwaInstall: () => Promise.reject(),
});

// eslint-disable-next-line react-refresh/only-export-components
export const useReactPWAInstall = () => useContext(ReactPWAInstallContext);

const platform = getPlatform();

interface ReactPWAInstallProviderProps {
  children: ReactNode;
  enableLogging?: boolean;
}

export const ReactPWAInstallProvider = ({
  children,
  enableLogging = false,
}: ReactPWAInstallProviderProps) => {
  const awaitingPromiseRef = useRef<AwaitingPromise | null>(null);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [dialogState, setDialogState] = useState<PWAInstallOptions | null>(
    null
  );

  const logger = useCallback(
    (message: string, ...args: unknown[]) => {
      if (enableLogging) {
        console.log(message, ...args);
      }
    },
    [enableLogging]
  );

  const isInstalled = useCallback(() => {
    if (
      // @ts-expect-error standalone is not a standard property, only available on iOS
      window.navigator?.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      logger("isInstalled: true. Already in standalone mode");
      return true;
    }
    logger("isInstalled: false.");
    return false;
  }, [logger]);

  const supported = useCallback(() => {
    if (deferredPrompt.current != null && platform === platforms.NATIVE) {
      logger("supported: true - native platform");
      return true;
    }
    if (platform !== platforms.NATIVE && platform !== platforms.OTHER) {
      logger("supported: true - manual support");
      return true;
    }
    logger("supported: false");
    return false;
  }, [deferredPrompt, logger]);

  const openDialog = (options?: PWAInstallOptions): Promise<void> => {
    setDialogState(options || {});
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const handleClose = () => {
    setDialogState(null);
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }
  };

  const handleInstall = () => {
    logger("handleInstall called");
    setDialogState(null);
    if (deferredPrompt.current != null) {
      return deferredPrompt.current
        .prompt()
        .then(() => deferredPrompt.current!.userChoice)
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            logger("PWA native installation successful");
            if (awaitingPromiseRef.current) {
              awaitingPromiseRef.current.resolve();
            }
          } else {
            logger("User opted out by cancelling native installation");
            if (awaitingPromiseRef.current) {
              awaitingPromiseRef.current.reject();
            }
          }
        })
        .catch((err) => {
          if (awaitingPromiseRef.current) {
            awaitingPromiseRef.current.resolve();
          }
          logger("Error occurred in the installing process: ", err);
        });
    } else {
      if (awaitingPromiseRef.current) {
        awaitingPromiseRef.current.resolve();
      }
    }
  };

  const [contextValue, setContextValue] = useState<PWAInstallContextValue>({
    supported,
    isInstalled,
    pwaInstall: openDialog,
  });

  useEffect(() => {
    const abortController = new AbortController();
    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        event.preventDefault();
        deferredPrompt.current = event;
        logger("beforeinstallprompt event fired and captured");
        setContextValue({
          supported,
          isInstalled,
          pwaInstall: openDialog,
        });
      },
      { signal: abortController.signal }
    );
    return () => {
      abortController.abort();
    };
  }, [isInstalled, logger, supported]);

  return (
    <>
      <ReactPWAInstallContext.Provider value={contextValue}>
        {children}
      </ReactPWAInstallContext.Provider>

      <InstallDialog
        open={Boolean(dialogState)}
        onSubmit={handleInstall}
        onClose={handleClose}
        platform={platform}
        {...dialogState}
      />
    </>
  );
};

export default ReactPWAInstallProvider;
