import { Button } from "@/components/ui/button";
import {
  Outlet,
  createFileRoute,
  redirect,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    const session = await context.supabaseClient.auth.getSession();
    if (!session.data.session) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <>
      {/*Back button*/}
      {canGoBack && (
        <Button
          variant="secondary"
          size="icon"
          className="m-1"
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      )}
      <Outlet />
    </>
  );
}
