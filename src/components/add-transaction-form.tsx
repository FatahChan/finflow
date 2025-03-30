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
import { useAccountQuery, useAddTransactionMutation } from "@/hooks/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DateTimePicker24h } from "./ui/date-time-picker-24h";

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
  name: z.string().min(3, "Name must be at least 3 characters long"),
  category: z.string().min(3, "Category must be at least 3 characters long"),
  transaction_at: z.string().datetime(),
});

export function AddTransactionForm() {
  const { id: accountId } = useParams({
    from: "/_protected/account/$id/transaction",
  });

  const { data: accounts, isPending } = useAccountQuery();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: accountId ?? accounts?.at(0)?.id ?? "",
      // @ts-expect-error this has to be an empty string to show placeholder
      amount: "",
      transaction_type: "debit",
      name: "",
      category: "",
      transaction_at: new Date().toISOString(),
    },
  });

  const { mutate: addTransaction } = useAddTransactionMutation({
    onSuccess: () => {
      form.reset();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addTransaction(values);
  }

  useEffect(() => {
    if (isPending) return;
    if (!accounts?.length) return;
    if (accounts.length > 0) return;

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
  }, [accounts?.length, navigate, isPending]);

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
                  {accounts?.map((account) => (
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
                pattern="[0-9]*\.?[0-9]{0,2}"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <CategoryFormItem />
        <FormField
          control={form.control}
          name="transaction_at"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormControl>
                <DateTimePicker24h
                  value={field.value}
                  onChange={field.onChange}
                  toISOString={true}
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

function CategoryFormItem() {
  const form = useFormContext(); // retrieve those props

  const transactionType = useWatch({
    control: form.control,
    name: "transaction_type",
  });

  return (
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
  );
}
