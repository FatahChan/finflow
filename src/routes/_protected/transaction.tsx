import NoData from "@/components/ui/no-data";
import { transactionQueryOptions } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/transaction")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData(transactionQueryOptions);
  },
  staticData: {
    crumb: "Transactions",
  },
});

function RouteComponent() {
  const { data: transactions } = useSuspenseQuery(transactionQueryOptions);
  if (transactions.count === 0) {
    return <NoData />;
  }
  return <div>{JSON.stringify(transactions.data)}</div>;
}
