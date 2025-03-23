import { AutoComplete } from "@/components/ui/auto-complete";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountQueryOptions, useAddTransactionMutation } from "@/lib/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const expenseCategories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Housing",
  "Utilities",
  "Health",
  "Education",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Gift",
  "Investments",
  "Other",
];

const formSchema = z.object({
  account_id: z.string(),
  amount: z
    .string()
    .min(1, "Amount cannot be empty")
    .regex(/^[0-9]*\.?[0-9]{0,2}$/, "Invalid amount")
    .transform((value) => Number.parseFloat(value)),
  transaction_type: z.enum(["debit", "credit"]),
  name: z.string().min(3),
  category: z.string(),
});
export function AddTransactionForm({ accountId }: { accountId?: string }) {
  const { data: accounts } = useSuspenseQuery(accountQueryOptions);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: accountId ?? accounts?.data?.at(0)?.id ?? "",
      // @ts-expect-error this has to be an empty string to show placeholder
      amount: "",
      transaction_type: "debit",
      name: "",
      category: "",
    },
  });

  const { mutate: addTransaction } = useAddTransactionMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    addTransaction(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  }
  const transactionType = useWatch({
    control: form.control,
    name: "transaction_type",
  });

  if (!accounts.data?.length) {
    toast.error(
      <div>
        <h2>No accounts found</h2>
        <p>Please add an account first</p>
        <Button
          onClick={() => {
            navigate({
              to: "/account",
            });
          }}
        >
          Add Account
        </Button>
      </div>,
      {
        duration: 5000,
      },
    );
    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <Input
                  onChange={field.onChange}
                  value={field.value}
                  placeholder="Enter transaction name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!accountId}
              >
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts?.data?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transaction_type"
          render={({ field }) => (
            <FormItem className="w-full">
              <Select
                onValueChange={(value) => {
                  form.setValue("category", "");
                  field.onChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <Input
                onChange={(e) => {
                  const decimalRegex = /^[0-9]*\.?[0-9]{0,2}$/;
                  if (decimalRegex.test(e.target.value)) {
                    field.onChange(e.target.value);
                  }
                }}
                value={field.value}
                placeholder="Enter amount"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <AutoComplete
                  selectedValue={field.value}
                  onSelectedValueChange={field.onChange}
                  searchValue={field.value}
                  onSearchValueChange={field.onChange}
                  items={(transactionType === "debit"
                    ? expenseCategories
                    : incomeCategories
                  ).map((category) => ({
                    value: category,
                    label: category,
                  }))}
                  isLoading={false}
                  placeholder="Enter category"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="col-span-2">
          Submit
        </Button>
      </form>
    </Form>
  );
}
