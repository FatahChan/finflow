import { createFileRoute, Link } from "@tanstack/react-router";

import type React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Wallet } from "lucide-react";
import { Money } from "@/components/ui/money";

export const Route = createFileRoute("/_protected/accounts")({
  component: AccountsPage,
});
interface Account {
  id: string;
  name: string;
  currency: string;
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

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD",
  });

  useEffect(() => {
    const savedAccounts = localStorage.getItem("finance-accounts");
    const savedTransactions = localStorage.getItem("finance-transactions");

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    localStorage.setItem("finance-accounts", JSON.stringify(newAccounts));
  };

  const calculateAccountBalance = (accountId: string) => {
    return transactions
      .filter((t) => t.accountId === accountId)
      .reduce((balance, transaction) => {
        return transaction.type === "credit"
          ? balance + transaction.amount
          : balance - transaction.amount;
      }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      const updatedAccounts = accounts.map((account) =>
        account.id === editingAccount.id ? { ...account, ...formData } : account
      );
      saveAccounts(updatedAccounts);
    } else {
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
      };
      saveAccounts([...accounts, newAccount]);
    }

    setFormData({ name: "", currency: "USD" });
    setEditingAccount(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      currency: account.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    const updatedAccounts = accounts.filter(
      (account) => account.id !== accountId
    );
    saveAccounts(updatedAccounts);

    // Also remove related transactions
    const updatedTransactions = transactions.filter(
      (t) => t.accountId !== accountId
    );
    setTransactions(updatedTransactions);
    localStorage.setItem(
      "finance-transactions",
      JSON.stringify(updatedTransactions)
    );
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setFormData({ name: "", currency: "USD" });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b px-4 py-4">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Accounts</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Account" : "Create Account"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Checking Account"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAccount ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-4 py-6">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No accounts yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first account to start tracking your finances
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(account)}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{account.name}"?
                              This will also delete all associated transactions.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(account.id)}
                              className="bg-destructive hover:bg-destructive/80"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
