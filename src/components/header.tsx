import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function Header({
  title,
  backButton,
  actions,
}: {
  title: string;
  backButton?: boolean;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <div className="bg-card border-b px-4 py-4">
      <div className="flex items-center space-x-4">
        {canGoBack && backButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
        {actions}
      </div>
    </div>
  );
}
