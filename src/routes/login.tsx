import LoginPage from "@/components/login";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    context.supabaseClient.auth.getSession().then((res) => {
      console.log(res);
      if (res.data.session) {
        throw redirect({
          to: "/account",
          replace: true,
        });
      }
    });
  },
});
