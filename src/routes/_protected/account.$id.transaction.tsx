import { AddTransactionForm } from "@/components/add-transaction-form";
import { TransactionCard } from "@/components/transactino-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import NoData from "@/components/ui/no-data";
import { useTransactionByAccountIdQuery } from "@/hooks/queries";

import { createFileRoute } from "@tanstack/react-router";
import { ChevronsUpDown } from "lucide-react";

export const Route = createFileRoute("/_protected/account/$id/transaction")({
  component: RouteComponent,
  staticData: {
    crumb: "Transactions",
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const { data: transactions } = useTransactionByAccountIdQuery(params.id);

  return (
    <div className="flex flex-col gap-2 pb-2">
      <Card className="sticky top-2 gap-2 p-4">
        <Collapsible defaultOpen>
          <CardHeader className="flex items-center justify-between px-0">
            <CardTitle>Add Transaction </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CardContent className="p-0">
            <CollapsibleContent>
              <AddTransactionForm />
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>

      {!transactions?.length ? (
        <NoData message="No transactions yet. Add your first transaction above!" />
      ) : (
        <div className="flex flex-grow flex-col gap-2 px-2">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
