import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  loader: async ({ context }) => {
    return await context.supabaseClient.auth.getSession().then((res) => {
      if (!res.data.session) {
        throw redirect({
          to: "/login",
          replace: true,
        });
      }
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
