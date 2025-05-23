import { GitHubCorner } from "@/components/github-corner";
import HamburgerMenu from "@/components/hamburger-menu";
import useAuthStateChange from "@/hooks/useAuthStateChange";
import type { queryClient } from "@/lib/queryClient";
import type { supabaseClient } from "@/lib/supabase";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  supabaseClient: typeof supabaseClient;
  queryClient: typeof queryClient;
}>()({
  component: RootRoute,
});

function RootRoute() {
  useAuthStateChange();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br bg-primary from-[#6B46C1] from-opacity-95 via-opacity-100 via-primary to-[#00d4ff] to-opacity-70">
        <a
          href="https://github.com/FatahChan/finflow"
          className="github-corner"
          aria-label="View source on GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubCorner />
        </a>
        <HamburgerMenu className="fixed top-0 left-0" />
        <main className="mx-auto max-w-4xl p-2">
          <h1 className="mb-6 text-center font-semibold text-3xl text-white">
            FinFlow
          </h1>
          <div className="mx-auto w-xs rounded-lg bg-primary-foreground shadow-md backdrop-blur-sm dark:bg-gray-900/90">
            <Outlet />
          </div>
          <TanStackRouterDevtools />
        </main>
      </div>
    </>
  );
}
