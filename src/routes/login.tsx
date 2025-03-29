import LoginPage from "@/components/login";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.supabaseClient.auth.getSession();
    if (session.data.session) {
      throw redirect({
        to: "/account",
        replace: true,
      });
    }
  },
  component: LoginPage,
});
