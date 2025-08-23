// src/routes/index.tsx
import { Link, createFileRoute } from "@tanstack/react-router";

import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/instant-db";
import { transactionsWithAccountQuery } from "@/instant.queries";
import { use$ } from "@legendapp/state/react";
import { currencies$, defaultCurrency$ } from "@/lib/legend-state";
import { useMemo } from "react";

export const Route = createFileRoute("/_protected/")({
  component: HomePage,
});

export default function HomePage() {
  const { data, isLoading } = db.useQuery(transactionsWithAccountQuery);
  const transactions = data?.transactions;
  const defaultCurrency = use$(defaultCurrency$.get());
  const exchangeRates = use$(currencies$.exchangeRates.get());

  const totalBalance$ = useMemo(() => {
    if (!transactions || isLoading) return 0;
    return transactions.reduce((acc, transaction) => {
      if (transaction.account?.currency === defaultCurrency) {
        return acc + transaction.amount;
      } else {
        return (
          acc +
          transaction.amount * exchangeRates[transaction.account!.currency]
        );
      }
    }, 0);
  }, [transactions, isLoading, defaultCurrency, exchangeRates]);
  const totalBalance = use$(totalBalance$);

  console.log("totalBalance", totalBalance);
  console.log("transactions", transactions);
  console.log("isLoading", isLoading);
  console.log("defaultCurrency", defaultCurrency);
  console.log("exchangeRates", exchangeRates);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Finance Manager</h1>
        <p className="text-muted-foreground mt-1">
          Track your accounts and transactions
        </p>
      </div>

      {/* Total Balance */}
      <div className="px-4 py-6">
        <Card>
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Total Balance
              </p>
              <Money amount={totalBalance} currency={defaultCurrency} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <Link to="/transactions">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        </div>

        {!transactions || transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <Link to="/transactions">
                <Button>Add Your First Transaction</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => {
              return (
                <Card key={transaction.id}>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-1 flex flex-col min-w-0 gap-1">
                          <h3 className="font-medium text-foreground truncate">
                            {transaction.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {transaction.account?.name}
                            </p>
                            <Money
                              amount={transaction.amount}
                              currency={transaction.account!.currency}
                              positive={transaction.type === "credit"}
                            />
                          </div>
                          <div className="flex items-center justify-start gap-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                transaction.transactionAt
                              ).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
