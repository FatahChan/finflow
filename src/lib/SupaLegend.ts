import { observable } from "@legendapp/state";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { synced } from "@legendapp/state/sync";
import {
  configureSyncedSupabase,
  syncedSupabase,
} from "@legendapp/state/sync-plugins/supabase";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

const INDEXEDDB_VERSION = 4;
const INDEXEDDB_DATABASE_NAME = "finflow-legend";

// Provide a function to generate ids locally
export const generateId = () => self.crypto.randomUUID();
configureSyncedSupabase({
  generateId,
});

export const transaction$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "transaction",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-transaction`,
        version: INDEXEDDB_VERSION,
        tableNames: ["transaction"],
      }),
      name: "transaction",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    changesSince: "last-sync",
    fieldDeleted: "deleted",
  }),
);

export const account$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "account",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-account`,
        version: INDEXEDDB_VERSION,
        tableNames: ["account"],
      }),
      name: "account",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    changesSince: "last-sync",
    fieldDeleted: "deleted",
  }),
);

export const currency$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "currency",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    fieldId: "code",
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-currency`,
        version: INDEXEDDB_VERSION,
        tableNames: ["currency"],
      }),
      name: "currency",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    fieldDeleted: "deleted",
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
