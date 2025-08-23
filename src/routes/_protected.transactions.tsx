import { Link, createFileRoute } from "@tanstack/react-router";

import { zodResolver } from "@hookform/resolvers/zod";

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
  DialogClose,
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
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { db } from "@/lib/instant-db";
import { id } from "@instantdb/react";
import {
  accountsQuery,
  transactionsWithAccountQuery,
  type ReturnQuery,
} from "@/instant.queries";
import { use$ } from "@legendapp/state/react";

import { categories$ } from "@/lib/legend-state";
import { useState } from "react";
import { toast } from "sonner";

const searchSchema = z.object({
  filterAccount: z.string().default("all").catch("all"),
  filterType: z.enum(["all", "credit", "debit"]).default("all").catch("all"),
});

export const Route = createFileRoute("/_protected/transactions")({
  validateSearch: zodValidator(searchSchema),
  component: TransactionsPage,
});

export default function TransactionsPage() {
  const { filterAccount, filterType } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data, isLoading } = db.useQuery({
    transactions: {
      $: {
        where: {
          "account.id":
            filterAccount === "all" ? { $isNull: false } : filterAccount,
          type:
            filterType === "all" ? { $in: ["credit", "debit"] } : filterType,
        },
      },
      account: {},
    },
    ...accountsQuery,
  });
  const filteredTransactions = data?.transactions || [];
  const accounts = data?.accounts || [];

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
      {accounts.length > 0 && !isLoading && (
        <div className="px-4 py-4 bg-card border-b">
          <div className="flex space-x-2">
            <Select
              value={filterAccount}
              onValueChange={(value) =>
                navigate({ search: { filterAccount: value } })
              }
            >
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

            <Select
              value={filterType}
              onValueChange={(value: "credit" | "debit" | "all") =>
                navigate({ search: { filterType: value } })
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
                                    db.transact(
                                      db.tx.transactions[
                                        transaction.id
                                      ].delete()
                                    )
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

const transactionZodSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  amount: z.number(),
  type: z.enum(["credit", "debit"]),
  category: z.string(),
  transactionAt: z.string(),
});
type TransactionsFormZodType = z.infer<typeof transactionZodSchema>;
function TransactionDialog({
  children,
  transaction,
}: {
  children?: React.ReactNode;
  transaction?: ReturnQuery<
    typeof transactionsWithAccountQuery
  >["transactions"][number];
}) {
  const [open, setOpen] = useState(false);
  const handleSubmit = ({ accountId, ...data }: TransactionsFormZodType) => {
    try {
      if (transaction) {
        db.transact(
          db.tx.transactions[transaction.id].update({
            ...transaction,
            ...data,
          })
        );
      } else {
        const _id = id();
        db.transact([
          db.tx.transactions[_id].create({
            ...data,
          }),
          db.tx.accounts[accountId].link({
            transactions: _id,
          }),
        ]);
      }
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to create transaction: ${error}`);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button type="submit" className="flex-1">
            {transaction ? "Update" : "Create"}
          </Button>
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
  onSubmit: (data: TransactionsFormZodType) => void;
  children?: React.ReactNode;
}) {
  const categories = use$(categories$);

  const form = useForm({
    resolver: zodResolver(transactionZodSchema),
    defaultValues: {
      accountId: "",
      name: "",
      amount: 0,
      type: "credit",
      category: "",
      transactionAt: new Date().toISOString(),
    } as TransactionsFormZodType,
  });

  const { data } = db.useQuery(accountsQuery);
  const accounts = data?.accounts || [];

  const type = form.watch("type");

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
                  {accounts.map((account) => (
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
                onChange={(e) => field.onChange(Number(e.target.value))}
                value={Number(field.value)}
                type="number"
                placeholder="0.00"
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]*$"
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
                    {categories[type].map((category) => (
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
                  selected={new Date(field.value)}
                  onSelect={(value) => {
                    if (value) {
                      field.onChange(value.toISOString());
                    }
                  }}
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
