// src/routes/index.tsx
import { Link, createFileRoute } from "@tanstack/react-router";

import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/instant-db";
import { transactionsWithAccountQuery } from "@/instant.queries";
import { use$ } from "@legendapp/state/react";
import {
  currencies$,
  currencyValidator,
  defaultCurrency$,
} from "@/lib/legend-state";
import { useMemo } from "react";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { Header } from "@/components/header";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useReactPWAInstall } from "@/components/pwa-install";

export const Route = createFileRoute("/dashboard/home")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Home | FinFlow",
      },
    ],
  }),
});

export default function HomePage() {
  const { data, isLoading } = db.useQuery(transactionsWithAccountQuery);
  const transactions = data?.transactions;
  const defaultCurrency = use$(defaultCurrency$);
  const exchangeRates = use$(currencies$.exchangeRates);

  const totalBalance$ = useMemo(() => {
    if (!transactions || isLoading) return 0;
    return transactions.reduce((acc, transaction) => {
      const account = transaction.account;
      if (!account) return acc;

      const currency = currencyValidator.parse(account.currency);
      const amount = transaction.type === "credit" ? transaction.amount : -transaction.amount;
      if (account.currency === defaultCurrency) {
        return acc + amount;
      } else {
        return acc + amount * exchangeRates[currency];
      }
    }, 0);
  }, [transactions, isLoading, defaultCurrency, exchangeRates]);
  const totalBalance = use$(totalBalance$);

  // Calculate this month's income and expenses
  const thisMonthSummary = useMemo(() => {
    if (!transactions || isLoading) return { income: 0, expenses: 0 };
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(transaction => new Date(transaction.transactionAt) >= startOfMonth)
      .reduce((acc, transaction) => {
        const account = transaction.account;
        if (!account) return acc;


        const currency = currencyValidator.parse(account.currency);
        let amount = transaction.amount;
        if (account.currency !== defaultCurrency) {
          amount = amount * exchangeRates[currency];
        }

        if (transaction.type === "credit") {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
        return acc;
      }, { income: 0, expenses: 0 });
  }, [transactions, isLoading, defaultCurrency, exchangeRates]);

  const { isInstalled } = useReactPWAInstall();
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Header
        title={
          <Link to={isInstalled() ? "/dashboard/home" : "/"}>FinFlow</Link>
        }
        actions={<NavigationDrawer />}
      />

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

      {/* Income & Expenses Summary */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            This Month
          </h2>
          <Button size="sm" variant="outline" onClick={() => window.location.href = '/dashboard/analytics'}>
            <BarChart3 className="h-4 w-4 mr-1" />
            View Analytics
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Income</p>
                  <Money 
                    amount={thisMonthSummary.income} 
                    currency={defaultCurrency}
                    className="text-green-600 font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <Money 
                    amount={thisMonthSummary.expenses} 
                    currency={defaultCurrency}
                    className="text-red-600 font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <Link
            from="/dashboard/home"
            to="/dashboard/transactions"
            search={{
              filterAccount: "all",
              filterType: "all",
            }}
          >
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        </div>

        {!transactions || transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <HandCoins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <Link
                from="/dashboard/home"
                to="/dashboard/transactions"
                search={{
                  filterAccount: "all",
                  filterType: "all",
                }}
              >
                <Button>Add Your First Transaction</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => {
              if (!transaction.account) return null;
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
                              {transaction.account.name}
                            </p>
                            <Money
                              amount={transaction.amount}
                              currency={transaction.account.currency}
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
