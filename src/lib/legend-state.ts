import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "@/actions/account";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/actions/transaction";
import { observable } from "@legendapp/state";
import { syncedCrud } from "@legendapp/state/sync-plugins/crud";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { v7 as uuidv7 } from "uuid";

const indexedDBPlugin = observablePersistIndexedDB({
  version: 3,
  databaseName: "Legend",
  tableNames: ["accounts", "transactions"],
});

export const accounts$ = observable(
  syncedCrud({
    list: () => getAccounts(),
    create: async (data) => {
      await createAccount({ data });
    },
    update: async (data) => {
      await updateAccount({ data });
    },
    delete: async (data) => {
      await deleteAccount({ data });
    },
    persist: {
      name: "accounts",
      plugin: indexedDBPlugin,
    },
    onSaved: ({ saved }) => {
      return {
        ...saved,
      };
    },
    generateId: () => uuidv7(),
  })
);

export const transactions$ = observable(
  syncedCrud({
    list: () => getTransactions(),
    create: async (data) => {
      await createTransaction({ data });
    },
    update: async (data) => {
      await updateTransaction({ data });
    },
    delete: async (data) => {
      await deleteTransaction({ data });
    },
    persist: {
      name: "transactions",
      plugin: indexedDBPlugin,
    },
    onSaved: ({ saved }) => {
      return {
        ...saved
      };
    },
    generateId: () => uuidv7(),
  })
);
