// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  component: HomePage,
  loader: async () => {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    return { transactions, accounts };
  }});

import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import {  useMemo } from "react";
import type { TransactionSelect } from "@/db/type";
import { getAccounts } from "@/actions/transaction-account";
import { getTransactions } from "@/actions/transaction";

const calculateAccountBalance = (
  accountId: string,
  transactions: TransactionSelect[]
) => {
  return transactions
    .filter((t) => t.accountId === accountId)
    .reduce((balance, transaction) => {
      return transaction.type === "credit"
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
};

export default function HomePage() {
  const { transactions, accounts } = Route.useLoaderData();

  const totalBalance = useMemo(
    () =>
      Object.values(accounts).reduce((total, account) => {
        return total + calculateAccountBalance(account.id, transactions);
      }, 0),
    [accounts, transactions]
  );

  const recentTransactions = useMemo(() => {
    return Object.values(transactions)
      .sort(
        (a, b) =>
          new Date(b.transactionAt).getTime() -
          new Date(a.transactionAt).getTime()
      )
      .slice(0, 5);
  }, [transactions]);

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
              <Money amount={totalBalance} currency="USD" />
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

        {recentTransactions.length === 0 ? (
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
            {recentTransactions.map((transaction) => {
              const account = Object.values(accounts).find(
                (a) => a.id === transaction.accountId
              );
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
                              {account?.name}
                            </p>
                            <Money
                              amount={transaction.amount}
                              currency={account!.currency}
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
