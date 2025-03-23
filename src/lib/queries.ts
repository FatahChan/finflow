// CRUD for accounts, currencies, transactions

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Database } from "./database.types";
import { supabaseClient } from "./supabase";

type Table =
  | keyof Database["public"]["Tables"]
  | keyof Database["public"]["Views"];
const ACCOUNT_QUERY_KEY: Table = "account";
export const accountQueryOptions = queryOptions({
  queryKey: [ACCOUNT_QUERY_KEY],
  queryFn: async () => await supabaseClient.from("account").select(),
});

const CURRENCY_QUERY_KEY: Table = "currency";
export const currencyQueryOptions = queryOptions({
  queryKey: [CURRENCY_QUERY_KEY],
  queryFn: async () => await supabaseClient.from("currency").select(),
});

const TRANSACTION_QUERY_KEY: Table = "transaction";
export const transactionQueryOptions = queryOptions({
  queryKey: [TRANSACTION_QUERY_KEY],
  queryFn: async () => await supabaseClient.from("transaction").select(),
});

export const accountByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [ACCOUNT_QUERY_KEY, id],
    queryFn: async () =>
      await supabaseClient.from("account").select().eq("id", id).single(),
  });

export const currencyByCodeQueryOptions = (code: string) =>
  queryOptions({
    queryKey: [CURRENCY_QUERY_KEY, code],
    queryFn: async () =>
      await supabaseClient.from("currency").select().eq("code", code).single(),
  });

export const transactionByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [TRANSACTION_QUERY_KEY, id],
    queryFn: async () =>
      await supabaseClient.from("transaction").select().eq("id", id).single(),
  });
export const transactionByAccountIdQueryOptions = (accountId: string) =>
  queryOptions({
    queryKey: [TRANSACTION_QUERY_KEY, accountId],
    queryFn: async () =>
      await supabaseClient
        .from("transaction")
        .select()
        .eq("account_id", accountId)
        .order("created_at", { ascending: false }),
  });

type Account = Database["public"]["Tables"]["account"]["Insert"];

export const useAddAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Account) => {
      const { data, error } = await supabaseClient
        .from("account")
        .insert(account)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
      toast.success("Account added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Account & { id: string }) => {
      const { data, error } = await supabaseClient
        .from("account")
        .update(account)
        .eq("id", account.id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabaseClient
        .from("account")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
      toast.success("Account deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAddTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      transaction: Database["public"]["Tables"]["transaction"]["Insert"],
    ) => {
      const { data, error } = await supabaseClient
        .from("transaction")
        .insert(transaction);
      console.log(data, error);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTION_QUERY_KEY] });
      toast.success("Transaction added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      transaction: Database["public"]["Tables"]["transaction"]["Insert"] & {
        id: string;
      },
    ) => {
      const { data, error } = await supabaseClient
        .from("transaction")
        .update(transaction)
        .eq("id", transaction.id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTION_QUERY_KEY] });
      toast.success("Transaction updated successfully");
    },
    onError: () => {
      toast.error("Failed to update transaction");
    },
  });
};

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabaseClient
        .from("transaction")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTION_QUERY_KEY] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useLoginGoogle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
