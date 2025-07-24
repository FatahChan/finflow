// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  component: HomePage,
});

import { useState, useEffect } from "react";
import { Plus, Wallet, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

interface Transaction {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  date: string;
}

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedAccounts = localStorage.getItem("finance-accounts");
    const savedTransactions = localStorage.getItem("finance-transactions");

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const calculateAccountBalance = (accountId: string) => {
    return transactions
      .filter((t) => t.accountId === accountId)
      .reduce((balance, transaction) => {
        return transaction.type === "credit"
          ? balance + transaction.amount
          : balance - transaction.amount;
      }, 0);
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalBalance = accounts.reduce((total, account) => {
    return total + calculateAccountBalance(account.id);
  }, 0);

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

      {/* Accounts Overview */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <Link to="/accounts">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          </Link>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No accounts yet</p>
              <Link to="/accounts">
                <Button>Create Your First Account</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">
                        {account.name}
                      </h3>
                      <Money
                        amount={calculateAccountBalance(account.id)}
                        currency={account.currency}
                        positive={calculateAccountBalance(account.id) >= 0}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              const account = accounts.find(
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
                              {new Date(transaction.date).toLocaleDateString()}
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
