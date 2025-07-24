import { createFileRoute, Link } from "@tanstack/react-router";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";

export const Route = createFileRoute("/_protected/transactions")({
  component: TransactionsPage,
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

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Income",
  "Investment",
  "Other",
];

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState({
    accountId: "",
    name: "",
    amount: "",
    type: "debit" as "credit" | "debit",
    category: categories[0],
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const savedAccounts = localStorage.getItem("finance-accounts");
    const savedTransactions = localStorage.getItem("finance-transactions");

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
      setFilteredTransactions(parsedTransactions);
    }
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (filterAccount !== "all") {
      filtered = filtered.filter((t) => t.accountId === filterAccount);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setFilteredTransactions(filtered);
  }, [transactions, filterAccount, filterType]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(
      "finance-transactions",
      JSON.stringify(newTransactions)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === editingTransaction.id
          ? {
              ...transaction,
              ...formData,
              amount: Number.parseFloat(formData.amount),
            }
          : transaction
      );
      saveTransactions(updatedTransactions);
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...formData,
        amount: Number.parseFloat(formData.amount),
      };
      saveTransactions([...transactions, newTransaction]);
    }

    setFormData({
      accountId: "",
      name: "",
      amount: "",
      type: "debit",
      category: categories[0],
      date: new Date().toISOString().split("T")[0],
    });
    setEditingTransaction(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      accountId: transaction.accountId,
      name: transaction.name,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (transactionId: string) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== transactionId
    );
    saveTransactions(updatedTransactions);
  };

  const openCreateDialog = () => {
    setEditingTransaction(null);
    setFormData({
      accountId: accounts.length > 0 ? accounts[0].id : "",
      name: "",
      amount: "",
      type: "debit",
      category: categories[0],
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const getAccountById = (accountId: string) => {
    return accounts.find((account) => account.id === accountId);
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
            <h1 className="text-xl font-semibold text-foreground">
              Transactions
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={openCreateDialog}
                disabled={accounts.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, accountId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Transaction Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Grocery shopping"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "credit" | "debit") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (Income)</SelectItem>
                      <SelectItem value="debit">Debit (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingTransaction ? "Update" : "Add"}
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

      {/* Filters */}
      {accounts.length > 0 && (
        <div className="px-4 py-4 bg-card border-b">
          <div className="flex space-x-2">
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="px-4 py-6">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No accounts found
              </h3>
              <p className="text-muted-foreground mb-6">
                You need to create an account first before adding transactions
              </p>
              <Link to="/accounts">
                <Button>Create Account</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Add your first transaction to start tracking your finances
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const account = getAccountById(transaction.accountId);
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
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Transaction
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {transaction.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction.id)}
                                  className="bg-destructive hover:bg-destructive/80"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
