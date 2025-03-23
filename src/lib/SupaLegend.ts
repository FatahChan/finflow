import { observable } from "@legendapp/state";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { useObservable } from "@legendapp/state/react";
import { configureSynced } from "@legendapp/state/sync";
import {
  type SupabaseCollectionOf,
  type SupabaseRowOf,
  type SupabaseSchemaOf,
  type SupabaseTableOf,
  syncedSupabase,
} from "@legendapp/state/sync-plugins/supabase";
import type {
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
} from "@supabase/postgrest-js";
import type { Database } from "./database.types";
import { supabaseClient } from "./supabase";

// Provide a function to generate ids locally
const generateId = () => self.crypto.randomUUID();

// Create a configured sync function
export const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin: observablePersistIndexedDB({
      databaseName: "finflow-legend",
      version: 1,
      tableNames: ["account", "transactions", "currency", "account_balance"],
    }),
  },
  generateId,
  supabase: supabaseClient,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  // Optionally enable soft deletes
  fieldDeleted: "deleted",
});

const accountObservableOptions = customSynced({
  supabase: supabaseClient,
  collection: "account",
  select: (from) =>
    from.select("id,user_id,name,currency_code,created_at,updated_at,deleted"),
  actions: ["read", "create", "update", "delete"],
  realtime: true,
  // Persist data and pending changes locally
  persist: {
    name: "account",
    retrySync: true, // Persist pending changes and retry
  },
  retry: {
    infinite: true, // Retry changes with exponential backoff
  },
});

export const account$ = observable(accountObservableOptions);

type Client = typeof supabaseClient;
type SelectFn<
  TTable extends SupabaseCollectionOf<Client, "public">,
  TRemote extends SupabaseRowOf<Client, TTable, "public"> = SupabaseRowOf<
    Client,
    TTable,
    "public"
  >,
> = (
  query: PostgrestQueryBuilder<
    SupabaseSchemaOf<Client>,
    SupabaseTableOf<Client, "public">[TTable],
    TTable
  >,
) => PostgrestFilterBuilder<
  SupabaseSchemaOf<Client>,
  TRemote,
  TRemote[],
  TTable,
  []
>;
export const useAccount$ = (select: SelectFn<"account">) =>
  useObservable(
    customSynced({
      supabase: supabaseClient,
      collection: "account",
      actions: ["read", "create", "update", "delete"],
      realtime: true,
      select: (query) => select(query),
      // Persist data and pending changes locally
      persist: {
        name: "account",
        retrySync: true, // Persist pending changes and retry
      },
      retry: {
        infinite: true, // Retry changes with exponential backoff
      },
    }),
  );

export const transactions$ = observable(
  customSynced({
    supabase: supabaseClient,
    collection: "transaction",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      name: "transaction",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  }),
);

export const currency$ = observable(
  customSynced({
    supabase: supabaseClient,
    collection: "currency",
    select: (from) => from.select("code,slug,symbol"),
    actions: ["read"],
    realtime: true,
    fieldId: "code",
    // Persist data and pending changes locally
    persist: {
      name: "currency",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  }),
);

export const accountBalances$ = observable(
  customSynced({
    supabase: supabaseClient,
    // @ts-expect-error
    collection: "account_balance",
    select: (from) => from.select("account_id,balance"),
    actions: ["read"],
    realtime: true,
    fieldId: "account_id",
    // Persist data and pending changes locally
    persist: {
      name: "account_balance",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  }),
);

export const addAccount = (
  values: Database["public"]["Tables"]["account"]["Insert"],
) => {
  const id = generateId();
  return account$[id].assign(values);
};

export const editAccount = (
  id: string,
  values: Database["public"]["Tables"]["account"]["Update"],
) => {
  return account$[id].assign(values);
};

export const deleteAccount = (id: string) => {
  return account$[id].delete();
};
