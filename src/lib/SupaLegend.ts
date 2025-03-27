import { observable } from "@legendapp/state";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { configureSynced, synced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

const INDEXEDDB_VERSION = 3;
const INDEXEDDB_DATABASE_NAME = "finflow-legend";
const plugin = observablePersistIndexedDB({
  databaseName: `${INDEXEDDB_DATABASE_NAME}-supabase-data`,
  version: INDEXEDDB_VERSION,
  tableNames: ["account", "transaction", "currency"],
});

// Provide a function to generate ids locally
export const generateId = () => self.crypto.randomUUID();
// Create a configured sync function
export const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin,
  },
  generateId,
  supabase: supabaseClient,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  // Optionally enable soft deletes
  fieldDeleted: "deleted",
});

export const transaction$ = observable(
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

export const account$ = observable(
  customSynced({
    supabase: supabaseClient,
    collection: "account",
    select: (from) => from.select("*"),
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
  }),
);

export const currency$ = observable(
  customSynced({
    supabase: supabaseClient,
    collection: "currency",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
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

export const sessionStore$ = observable<Session | null>(
  synced({
    initial: null,
    persist: {
      name: "session",
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-session`,
        version: INDEXEDDB_VERSION,
        tableNames: ["session"],
      }),
    },
  }),
);
