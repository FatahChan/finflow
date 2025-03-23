import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  loader: async () => {
    throw redirect({
      to: "/account",
      replace: true,
    });
  },
  staticData: {
    crumb: "Home",
  },
});
