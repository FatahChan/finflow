import { createFileRoute, Link } from "@tanstack/react-router";

import type React from "react";

import { use, useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { TransactionInsert, TransactionSelect } from "@/db/type";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { v7 as uuidv7 } from "uuid";
import { DialogClose } from "@radix-ui/react-dialog";
import { getAccounts } from "@/actions/transaction-account";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "@/actions/transaction";

export const Route = createFileRoute("/_protected/transactions")({
  component: TransactionsPage,
  loader: async () => {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    return { transactions, accounts };
  },
});

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

  const { transactions, accounts } = Route.useLoaderData();

  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterType, setFilterType] = useState<
    TransactionSelect["type"] | "all"
  >("all");

  const filteredTransactions = Object.values(transactions)
    .filter((t) => filterType === "all" || t.type === filterType)
    .filter((t) => filterAccount === "all" || t.accountId === filterAccount);

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

          <TransactionDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </TransactionDialog>
        </div>
      </div>

      {/* Filters */}
      {Object.values(accounts).length > 0 && (
        <div className="px-4 py-4 bg-card border-b">
          <div className="flex space-x-2">
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {Object.values(accounts).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterType}
              onValueChange={(value: "credit" | "debit" | "all") =>
                setFilterType(value)
              }
            >
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
        {Object.values(accounts).length === 0 ? (
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
              <TransactionDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </TransactionDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const account = accounts.find(account=> account.id === transaction.accountId)
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
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex flex-col gap-2">
                          <TransactionDialog transaction={transaction}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent hover:bg-primary hover:text-primary-foreground"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TransactionDialog>
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
                                  onClick={() =>
                                    deleteTransaction({data: {id: transaction.id}})
                                  }
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

function TransactionDialog({
  children,
  transaction,
}: {
  children?: React.ReactNode;
  transaction?: TransactionSelect;
}) {
  const handleSubmit = (data: TransactionInsert) => {
    if (transaction) {
      updateTransaction({data: {
        ...transaction,
        id: transaction.id,
        createdAt: transaction.createdAt,
        updatedAt: new Date(),
        ...data,
    }});
    } else {
      const id = uuidv7();
      createTransaction({data:{
        ...data,
        transactionAt: data.transactionAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        id,
      }});
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm">
            {transaction ? (
              <Edit className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm onSubmit={handleSubmit}>
          <DialogClose asChild>
            <Button type="submit" className="flex-1">
              {transaction ? "Update" : "Create"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </TransactionForm>
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  onSubmit,
  children,
}: {
  onSubmit: (data: TransactionInsert) => void;
  children?: React.ReactNode;
}) {
  const form = useForm<TransactionInsert>({
    defaultValues: {
      name: "",
      amount: 0,
      type: "credit",
      category: "",
      transactionAt: new Date(),
    },
  });
  const accounts = use(getAccounts());
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(accounts).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the account associated with this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <Input {...field} placeholder="e.g., Grocery shopping" />
              <FormDescription>
                Enter a name for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <Input
                {...field}
                type="number"
                placeholder="0.00"
                inputMode="decimal"
                min={0}
              />
              <FormDescription>
                Enter the amount for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select {...field}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Income)</SelectItem>
                  <SelectItem value="debit">Debit (Expense)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the category for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Date</FormLabel>
              <FormControl>
                <Calendar
                  className="w-full"
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Select the date for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-2 pt-4">{children}</div>
      </form>
    </Form>
  );
}
