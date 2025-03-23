import { TrashIcon } from "@/components/icons/trash-icon";
import { Button } from "@/components/ui/button";
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
  accountQueryOptions,
  useAddAccountMutation,
  useDeleteAccountMutation,
} from "@/lib/queries";
import { supabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_protected/account/")({
  component: AccountPage,
  staticData: {
    crumb: "Account",
  },
});

function AccountPage() {
  const { data: accounts } = useSuspenseQuery(accountQueryOptions);
  const { mutate: deleteAccount } = useDeleteAccountMutation();

  return (
    <>
      <AddAccountForm />
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {accounts.data?.length === 0 ? <NoData /> : null}
        {accounts.data?.map((account) => (
          <li key={account.id} className="flex items-center gap-3 py-4">
            <Button
              variant="link"
              className={cn(
                "flex-1 justify-between text-left text-gray-800 dark:text-gray-100",
              )}
              asChild
            >
              <Link to={"/account/$id/transaction"} params={{ id: account.id }}>
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
          </li>
        ))}
      </ul>
    </>
  );
}

const formSchema = z.object({
  name: z.string().trim().min(1),
  currency_code: z.string().trim(),
});

function AddAccountForm() {
  const { mutate: addAccount } = useAddAccountMutation();
  const { data: currencies } = useSuspenseQuery({
    queryKey: ["currencies"],
    queryFn: async () => await supabaseClient.from("currency").select(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency_code: "",
    },
  });
  return (
    <Form {...form}>
      <form
        className="flex flex-col items-center justify-center gap-4 p-4"
        onSubmit={form.handleSubmit((data) => addAccount(data))}
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
                  {currencies?.data?.map((currency) => (
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
  );
}
