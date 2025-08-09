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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";

import { Wallet } from "lucide-react";
import { Money } from "@/components/ui/money";
import { currencies } from "@/db/currencies";
import { v7 as uuidv7 } from "uuid";
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
import type {
  TransactionAccountInsert,
  TransactionAccountSelect,
} from "@/db/type";
import { use, useMemo } from "react";
import { createAccount, deleteAccount, getAccounts, updateAccount } from "@/actions/transaction-account";
import { getTransactions } from "@/actions/transaction";

export const Route = createFileRoute("/_protected/accounts")({
  component: AccountsPage,
});

export default function AccountsPage() {
  const accounts = use(getAccounts())
  const transactions = use(getTransactions())

  const calculateAccountBalance = useMemo(() => {
    return (accountId: string) => {
      const accountTransactions = transactions.filter(
        (transaction) => transaction.accountId === accountId
      );
      return accountTransactions.reduce((balance, transaction) => {
        return balance + transaction.amount;
      }, 0);
    };
  }, [accounts])
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
          <AccountDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </AccountDialog>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-4 py-6">
        {Object.values(accounts).length === 0 ? (
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
            {Object.values(accounts)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((account) => (
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
                        <AccountDialog>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-primary hover:text-primary-foreground"
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{account.name}
                                "? This will also delete all associated
                                transactions. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAccount({ data: { id: account.id } })}
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

function AccountDialog({
  account,
  children,
}: {
  account?: TransactionAccountSelect;
  children?: React.ReactNode;
}) {
  const handleSubmit = (data: TransactionAccountInsert) => {
    if (account) {
      updateAccount({
        data: {
          ...account,
          id: account.id,
          createdAt: account.createdAt,
          updatedAt: new Date(),
          ...data,
        }
      })
    } else {
      const id = uuidv7();

      createAccount({
        data: {
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  };
  return (
    <Dialog>
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
          <DialogClose asChild>
            <Button type="submit" className="flex-1">
              {account ? "Update" : "Create"}
            </Button>
          </DialogClose>
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
  onSubmit: (data: TransactionAccountInsert) => void;
  children: React.ReactNode;
}) {
  const form = useForm<TransactionAccountInsert>({
    defaultValues: {
      name: "",
      currency: "USD",
    },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("submit");
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
