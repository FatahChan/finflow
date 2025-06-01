import { Button } from "@/components/ui/button";

import {
  useAccountByIdQuery,
  useDeleteAccountMutation,
  useTransactionByAccountIdQuery,
} from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";

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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export const Route = createFileRoute("/_protected/account/$id/")({
  component: AccountDetailsPage,
});

function AccountDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: account, isPending: isAccountPending } =
    useAccountByIdQuery(id);
  const { data: transactions, isPending: isTransactionsPending } =
    useTransactionByAccountIdQuery(id);
  const { mutate: deleteAccount } = useDeleteAccountMutation();

  const { totalCredit, totalDebit, balance } = useMemo(() => {
    const totalCredit =
      transactions
        ?.filter((t) => t.transaction_type === "credit")
        .reduce((acc, t) => acc + Number(t.amount), 0) ?? 0;

    const totalDebit =
      transactions
        ?.filter((t) => t.transaction_type === "debit")
        .reduce((acc, t) => acc + Number(t.amount), 0) ?? 0;

    const balance = totalCredit - totalDebit;

    return { totalCredit, totalDebit, balance };
  }, [transactions]);

  const handleDelete = () => {
    deleteAccount(id);
    navigate({ to: "/account" });
  };

  if (isAccountPending || isTransactionsPending) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {account.name} ({account.currency_code})
            </span>
            <AlertDialog>
              <AlertDialogTrigger className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
          <CardDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Balance</span>
              <span>{formatCurrency(balance, account.currency_code)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Credit</span>
              <span className="text-green-600">
                {formatCurrency(totalCredit, account.currency_code)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Debit</span>
              <span className="text-red-600">
                {formatCurrency(Math.abs(totalDebit), account.currency_code)}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="default" size="sm" asChild className="w-full">
            <Link to="/account/$id/transaction" params={{ id }}>
              Add Transaction
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
