// CRUD for accounts, currencies, transactions

import {
  account$,
  currency$,
  generateId,
  sessionStore$,
  transaction$,
} from "@/lib/SupaLegend";
import type { RequiredFields } from "@/lib/type-util";
import { use$ } from "@legendapp/state/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import type { Database } from "../lib/database.types";
import { supabaseClient } from "../lib/supabase";

export const useAccountQuery = () => {
  const data = use$(() => {
    return Object.values(account$.get() ?? {});
  });
  return { data };
};

export const useCurrencyQuery = () => {
  const data = use$(() => {
    return Object.values(currency$.get() ?? {});
  });
  return { data };
};

export const useTransactionQuery = () => {
  const data = use$(() => {
    return Object.values(transaction$.get() ?? {});
  });
  return { data };
};

export const useAccountByIdQuery = (id: string) => {
  const data = use$(() => {
    return account$.get()[id];
  });
  return { data };
};
export const useCurrencyByCodeQuery = (code: string) => {
  const data = use$(() => {
    return currency$.get()[code];
  });
  return { data };
};

export const useTransactionByIdQuery = (id: string) => {
  const data = use$(() => {
    return transaction$.get()[id];
  });
  return { data };
};

export const useTransactionByAccountIdQuery = (accountId: string) => {
  const data = use$(() => {
    const transactionsMap = transaction$.get();
    return Object.values(transactionsMap ?? {}).filter(
      (transaction) => transaction.account_id === accountId,
    );
  });
  return { data };
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
      const { id, ...rest } = getMetaFields();
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
