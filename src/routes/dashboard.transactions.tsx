import { Link, createFileRoute } from "@tanstack/react-router";

import { zodResolver } from "@hookform/resolvers/zod";

import { Plus, Edit, Trash2, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import * as z from "zod/mini";
import { db } from "@/lib/instant-db";
import { id } from "@instantdb/react";
import {
  accountsQuery,
  transactionsWithAccountQuery,
  type ReturnQuery,
} from "@/instant.queries";
import { use$ } from "@legendapp/state/react";

import { categories$ } from "@/lib/legend-state";
import { lazy, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { NativeSelect } from "@/components/ui/native-select";
const Calendar = lazy(() =>
  import("@/components/ui/calendar").then((module) => ({
    default: module.Calendar,
  }))
);
const searchSchema = z.object({
  filterAccount: z.string().check(z.minLength(1, "Filter Account is required")),
  filterType: z
    .enum(["all", "credit", "debit"])
    .check(z.minLength(1, "Filter Type is required")),
});

export const Route = createFileRoute("/dashboard/transactions")({
  validateSearch: searchSchema,
  component: TransactionsPage,
  head: () => ({
    meta: [
      {
        title: "Transactions | FinFlow",
      },
    ],
  }),
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
      <Header
        title="Transactions"
        backButton
        actions={
          <>
            {filteredTransactions.length === 0 ? null : (
              <TransactionDialog>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </TransactionDialog>
            )}
            <NavigationDrawer />
          </>
        }
      />

      {/* Filters */}
      <div className="px-4 py-4 bg-card border-b">
        <div className="flex space-x-2">
          <NativeSelect
            value={filterAccount}
            onChange={(e) =>
              navigate({
                search: { filterAccount: e.target.value, filterType },
              })
            }
            className="flex-1"
          >
            {isLoading ? (
              <option disabled>Loading...</option>
            ) : (
              <>
                <option value="all">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </>
            )}
          </NativeSelect>

          <NativeSelect
            value={filterType}
            onChange={(e) =>
              navigate({
                search: {
                  filterAccount,
                  filterType: e.target.value as "all" | "credit" | "debit",
                },
              })
            }
            className="flex-1"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </NativeSelect>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 py-6">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <HandCoins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No accounts found
              </h3>
              <p className="text-muted-foreground mb-6">
                You need to create an account first before adding transactions
              </p>
              <Link to="/dashboard/accounts">
                <Button>Create Account</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <HandCoins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
  accountId: z.string().check(z.minLength(1, "Account is required")),
  name: z.string().check(z.minLength(1, "Name is required")),
  amount: z.number().check(z.minimum(1, "Amount is required")),
  type: z.enum(["credit", "debit"]),
  category: z.string().check(z.minLength(1, "Category is required")),
  transactionAt: z
    .string()
    .check(z.minLength(1, "Transaction Date is required")),
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
        const { account: _, ...transactionProps } = transaction ?? {};
        db.transact(
          db.tx.transactions[transaction.id].update({
            ...transactionProps,
            ...data,
          })
        );
      } else {
        const _id = id();
        db.transact([
          db.tx.transactions[_id].create({
            ...data,
          }),
          db.tx.transactions[_id].link({
            account: accountId,
          }),
        ]);
      }
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to create transaction: ${error}`);
    }
  };

  const { data: parsedTransaction } = transactionZodSchema.safeParse({
    accountId: transaction?.account?.id,
    name: transaction?.name,
    amount: transaction?.amount,
    type: transaction?.type,
    category: transaction?.category,
    transactionAt: transaction?.transactionAt,
  });
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
        <TransactionForm
          onSubmit={handleSubmit}
          defaultValues={parsedTransaction ?? undefined}
        >
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
  defaultValues,
}: {
  onSubmit: (data: TransactionsFormZodType) => void;
  children?: React.ReactNode;
  defaultValues?: TransactionsFormZodType;
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
      ...defaultValues,
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
              <NativeSelect
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                value={field.value}
                className="w-full"
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}{" "}
                    <span className="uppercase"> ({account.currency})</span>
                  </option>
                ))}
              </NativeSelect>
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
                value={Number(field.value) || undefined}
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
              <NativeSelect
                onChange={(e) => field.onChange(e.target.value)}
                value={field.value}
                className="w-full"
              >
                <option value="credit">Credit (Income)</option>
                <option value="debit">Debit (Expense)</option>
              </NativeSelect>
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
                <NativeSelect
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value}
                  className="w-full"
                >
                  <option value="">Select a category</option>
                  {categories[type].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
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
