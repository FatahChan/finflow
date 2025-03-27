import NoData from "@/components/ui/no-data";
import { useTransactionQuery } from "@/hooks/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/transaction")({
  component: RouteComponent,
  staticData: {
    crumb: "Transactions",
  },
});

function RouteComponent() {
  const { data: transactions } = useTransactionQuery();
  if (transactions.length === 0) {
    return <NoData />;
  }
  return <div>{JSON.stringify(transactions)}</div>;
}
