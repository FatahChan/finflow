import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIDBPersister } from "./lib/react-query-persistor.ts";
import { supabaseClient } from "./lib/supabase.ts";
import reportWebVitals from "./reportWebVitals.ts";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 24, // 24 days
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 0,
    },
  },
});

const idbPersister = createIDBPersister();

// we need a default mutation function so that paused mutations can resume after a page reload
queryClient.setMutationDefaults(["account"], {
  mutationFn: async () => {
    // to avoid clashes with our optimistic update when an offline mutation continues
    await queryClient.cancelQueries({ queryKey: ["account"] });
    return supabaseClient.from("account").update({});
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    supabaseClient,
  },
  defaultStaleTime: 0,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    crumb?: string;
  }
  interface LoaderDataRouteOption {
    crumb?: string;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: idbPersister,
        }}
      >
        <RouterProvider router={router} />
        <Toaster />
      </PersistQueryClientProvider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
