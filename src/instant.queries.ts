import type { InstaQLParams, InstaQLResult } from "@instantdb/react";
import type { AppSchema } from "./instant.schema";


export const accountsQuery = {
  accounts: {},
} satisfies InstaQLParams<AppSchema>;

export const accountsWithTransactionsQuery = {
  accounts: {
    transactions: {},
    $: {
      order: {
        serverCreatedAt: "asc",
      },
    },
  },
} satisfies InstaQLParams<AppSchema>;

export const recentTransactionsWithAccountsQuery = {
  transactions: {
    account: {},
    $: {
      limit: 3,
      order: {
        transactionAt: "desc",
      },
    },
  },
} satisfies InstaQLParams<AppSchema>;


export const transactionsWithAccountQuery = {
  transactions: { account: {}, $: { order: { transactionAt: "desc" } } },
} satisfies InstaQLParams<AppSchema>;


export type ReturnQuery<T extends InstaQLParams<AppSchema>> = InstaQLResult<AppSchema, T>