// CRUD for accounts, currencies, transactions

import {
  account$,
  currency$,
  generateId,
  sessionStore$,
  transaction$,
} from "@/lib/SupaLegend";
import type { RequiredFields } from "@/lib/type-util";
import { syncState, when } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { Database } from "../lib/database.types";
import { supabaseClient } from "../lib/supabase";

export const useAccountQuery = () => {
  const syncState$ = syncState(account$);
  const account = use$(account$);
  return useQuery({
    queryKey: ["account", account],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return Object.values(account$.get() ?? {});
    },
  });
};

export const useCurrencyQuery = () => {
  const syncState$ = syncState(currency$);
  const currency = use$(currency$);
  return useQuery({
    queryKey: ["currency", currency],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return Object.values(currency$.get() ?? {});
    },
  });
};

export const useTransactionQuery = () => {
  const syncState$ = syncState(transaction$);
  const transaction = use$(transaction$);
  return useQuery({
    queryKey: ["transaction", transaction],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return Object.values(transaction$.get() ?? {});
    },
  });
};

export const useAccountByIdQuery = (id: string) => {
  const syncState$ = syncState(account$);
  const account = use$(account$[id]);
  return useQuery({
    queryKey: ["account", id, account],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return account$.get()[id];
    },
  });
};
export const useCurrencyByCodeQuery = (code: string) => {
  const syncState$ = syncState(currency$[code]);
  const currency = use$(currency$[code]);
  return useQuery({
    queryKey: ["currency", code, currency],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return currency$.get()[code];
    },
  });
};

export const useTransactionByIdQuery = (id: string) => {
  const syncState$ = syncState(transaction$[id]);
  const transaction = use$(transaction$[id]);
  return useQuery({
    queryKey: ["transaction", id, transaction],
    queryFn: async () => {
      await when(syncState$.isPersistLoaded);
      return transaction$.get()[id];
    },
  });
};

export const useTransactionByAccountIdQuery = (accountId: string) => {
  const { data: transactions, ...rest } = useTransactionQuery();
  const data = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => t.account_id === accountId);
  }, [transactions, accountId]);
  return { data, ...rest };
};

const getMetaFields = () => {
  const id = generateId();
  const now = new Date().toISOString();
  const user_id = sessionStore$.peek()?.user.id;
  return {
    id,
    created_at: now,
    updated_at: now,
    deleted: false,
    user_id: user_id,
  };
};

type AccountInsert = Database["public"]["Tables"]["account"]["Insert"];
export const useAddAccountMutation = () => {
  const navigate = useNavigate();
  const mutate = useCallback(
    (account: AccountInsert) => {
      const { id, user_id, ...rest } = getMetaFields();
      if (!user_id) {
        toast.error("User not found");
        navigate({ to: "/login" });
        return;
      }
      account$[id].set({
        ...account,
        id,
        user_id,
        ...rest,
      });
      toast.success("Account added successfully");
    },
    [navigate],
  );
  return { mutate };
};

export type AccountUpdate = Database["public"]["Tables"]["account"]["Update"];
export const useUpdateAccountMutation = () => {
  const mutate = useCallback((account: AccountUpdate & { id: string }) => {
    account$[account.id].assign({
      ...account,
    });
    toast.success("Account updated successfully");
  }, []);
  return { mutate };
};

export const useDeleteAccountMutation = () => {
  const mutate = useCallback((id: string) => {
    account$[id].delete();
    toast.success("Account deleted successfully");
  }, []);
  return { mutate };
};

export type TransactionInsert =
  Database["public"]["Tables"]["transaction"]["Insert"];
export const useAddTransactionMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const mutate = useCallback(
    (
      transaction: TransactionInsert &
        RequiredFields<
          TransactionInsert,
          "category" | "transaction_at" | "transaction_type"
        >,
    ) => {
      const { id, user_id: _, ...rest } = getMetaFields();
      transaction$[id].set({
        ...transaction,
        id,
        ...rest,
      });
      toast.success("Transaction added successfully");
      onSuccess?.();
    },
    [onSuccess],
  );
  return { mutate };
};

export type TransactionUpdate =
  Database["public"]["Tables"]["transaction"]["Update"];
export const useUpdateTransactionMutation = () => {
  const mutate = useCallback(
    (transaction: TransactionUpdate & { id: string }) => {
      transaction$[transaction.id].assign({
        ...transaction,
      });
      toast.success("Transaction updated successfully");
    },
    [],
  );
  return { mutate };
};

export const useDeleteTransactionMutation = () => {
  const mutate = useCallback((id: string) => {
    transaction$[id].delete();
    toast.success("Transaction deleted successfully");
  }, []);
  return { mutate };
};

export const useLoginGoogle = () => {
  const mutate = useCallback(
    () =>
      supabaseClient.auth
        .signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        })
        .then((res) => {
          if (res.error) {
            toast.error(res.error.message);
          }
        }),
    [],
  );
  return { mutate };
};

export const useLogout = () => {
  const mutate = useCallback(() => {
    supabaseClient.auth.signOut().then((res) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      window.location.href = "/";
    });
  }, []);
  return { mutate };
};
