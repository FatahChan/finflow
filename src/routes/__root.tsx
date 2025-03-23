import { GitHubCorner } from "@/components/github-corner";
import { supabaseClient } from "@/lib/supabase";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootRoute,
  },
);

function RootRoute() {
  const queryClient = useQueryClient();
  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;
    supabaseClient.auth.getSession().then((res) => {
      if (!res.data.session) {
        return;
      }
      sub = supabaseClient
        .channel("schema-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
          },
          (payload) => {
            console.log(payload.table);
            queryClient.invalidateQueries({ queryKey: [payload.table] });
          },
        )
        .subscribe();
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [queryClient]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#6B46C1] from-opacity-95 via-opacity-100 via-primary to-[#00d4ff] to-opacity-70">
        <a
          href="https://github.com/FatahChan/finflow-legend-state-supabase"
          className="github-corner"
          aria-label="View source on GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubCorner />
        </a>
        <main className="mx-auto max-w-4xl p-6">
          <h1 className="mb-6 text-center font-semibold text-3xl text-white">
            FinFlow
          </h1>
          <p className="my-2 text-center text-gray-200">
            data is reset every 30 minutes
          </p>
          <div className="mx-auto w-xs rounded-lg bg-white/90 text-center shadow-md backdrop-blur-sm dark:bg-gray-900/90">
            <Outlet />
          </div>
          <TanStackRouterDevtools />
        </main>
      </div>
    </>
  );
}
