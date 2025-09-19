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
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash2 } from "lucide-react";

import { Wallet } from "lucide-react";
import { Money } from "@/components/ui/money";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMemo, useState } from "react";
import { db } from "@/lib/instant-db";
import {
  accountsWithTransactionsQuery,
  type ReturnQuery,
} from "@/instant.queries";
import * as z from "zod/mini";
import { id } from "@instantdb/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { currencies, type Currency } from "@/lib/legend-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { NativeSelect } from "@/components/ui/native-select";

export const Route = createFileRoute("/dashboard/accounts")({
  component: AccountsPage,
  head: () => ({
    meta: [
      {
        title: "Accounts | FinFlow",
      },
    ],
  }),
});

export default function AccountsPage() {
  const { data, isLoading } = db.useQuery(accountsWithTransactionsQuery);
  const accounts = data?.accounts;

  const accountsBalance = useMemo<Record<string, number>>(() => {
    if (!accounts) return {};
    return accounts.reduce((acc, account) => {
      return {
        ...acc,
        [account.id]: account.transactions.reduce((acc, transaction) => {
          return acc + transaction.amount;
        }, 0),
      };
    }, {});
  }, [accounts]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Header
        title="Accounts"
        backButton
        actions={
          <>
            {accounts?.length === 0 ? null : (
              <AccountDialog>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </AccountDialog>
            )}
            <NavigationDrawer />
          </>
        }
      />

      {/* Accounts List */}
      <div className="px-4 py-6">
        {accounts?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No accounts yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first account to start tracking your finances
              </p>
              <AccountDialog>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </AccountDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {accounts?.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={"/dashboard/transactions"}
                      search={{
                        filterAccount: account.id,
                        filterType: "all",
                      }}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">
                          {account.name}
                        </h3>
                        {isLoading ? (
                          <Skeleton className="h-4 w-20" />
                        ) : (
                          <Money
                            amount={accountsBalance[account.id]}
                            currency={account.currency}
                            positive={accountsBalance[account.id] >= 0}
                          />
                        )}
                      </div>
                    </Link>
                    <div className="flex space-x-2">
                      <AccountDialog>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </AccountDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{account.name}
                              "? This will also delete all associated
                              transactions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                db.transact(db.tx.accounts[account.id].delete())
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const accountZodSchema = z.object({
  name: z.string(),
  currency: z.string(),
});
type AccountZodType = z.infer<typeof accountZodSchema>;

function AccountDialog({
  account,
  children,
}: {
  account?: ReturnQuery<
    typeof accountsWithTransactionsQuery
  >["accounts"][number];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const user = db.useUser();
  const handleSubmit = (data: AccountZodType) => {
    if (account) {
      db.transact(
        db.tx.accounts[account.id].update({
          ...account,
          ...data,
        })
      );
    } else {
      const _id = id();

      db.transact([
        db.tx.accounts[_id].create({
          ...data,
        }),
        db.tx.accounts[_id].link({
          user: user!.id,
        }),
      ]).then(() => {
        setOpen(false);
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm">
            {account ? (
              <Edit className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Account" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        <AccountForm onSubmit={handleSubmit}>
            <Button type="submit" className="flex-1">
              {account ? "Update" : "Create"}
            </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </AccountForm>
      </DialogContent>
    </Dialog>
  );
}
function AccountForm({
  onSubmit,
  children,
}: {
  onSubmit: (data: AccountZodType) => void;
  children: React.ReactNode;
}) {
  const form = useForm<AccountZodType>({
    resolver: zodResolver(accountZodSchema),
    defaultValues: {
      name: "",
      currency: "usd",
    },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Checking Account" {...field} />
              </FormControl>
              <FormDescription>Enter your account name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <NativeSelect
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value as Currency);
                }}
                className="w-full uppercase"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency.toUpperCase()}
                  </option>
                ))}
              </NativeSelect>
              <FormDescription>Select your account currency</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2 pt-4">{children}</div>
      </form>
    </Form>
  );
}
