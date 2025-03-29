import { TrashIcon } from "@/components/icons/trash-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import NoData from "@/components/ui/no-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAccountQuery,
  useAddAccountMutation,
  useCurrencyQuery,
  useDeleteAccountMutation,
} from "@/hooks/queries";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_protected/account/")({
  component: AccountPage,
  staticData: {
    crumb: "Account",
  },
});

function AccountPage() {
  return (
    <div className="flex flex-col gap-4 pb-2">
      <AddAccountForm />
      <AccountList />
    </div>
  );
}

const formSchema = z.object({
  name: z.string().trim().min(1),
  currency_code: z.string().trim(),
});

function AddAccountForm() {
  const { mutate: addAccount } = useAddAccountMutation();
  const { data: currencies } = useCurrencyQuery();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency_code: "",
    },
  });
  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      addAccount(data);
      form.reset();
    },
    [addAccount, form],
  );
  return (
    <Card className="sticky top-0 z-10">
      <CardHeader>
        <CardTitle>Add Account</CardTitle>
        <CardDescription>Add a new account to your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Account name"
                      className="flex-grow rounded-md border p-3 shadow-sm"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies?.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full min-w-fit cursor-pointer rounded-md bg-primary px-3 py-2 text-primary-foreground shadow-md hover:bg-primary/80"
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AccountList() {
  const { data: accounts } = useAccountQuery();
  const sortedAccounts = useMemo(
    () => accounts?.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [accounts],
  );
  const { mutate: deleteAccount } = useDeleteAccountMutation();

  if (sortedAccounts?.length === 0) {
    return <NoData />;
  }
  return (
    <>
      {sortedAccounts?.map((account) => (
        <Card className="mx-2 p-2" key={account.id}>
          <CardContent className="flex flex-row justify-between p-0">
            <Button variant="link" asChild>
              <Link to={"/account/$id"} params={{ id: account.id }}>
                {account.name} ({account.currency_code})
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAccount(account.id)}
                className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
