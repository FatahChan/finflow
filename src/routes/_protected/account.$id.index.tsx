import { account$ } from "@/lib/SupaLegend";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/account/$id/")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const account = account$[params.id].get();
    return {
      crumb: account?.name,
    };
  },
});

function RouteComponent() {
  return <div>Hello "/account/$id"!</div>;
}
