// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    accounts: i.entity({
      currency: i.string(),
      name: i.string(),
    }),
    transactions: i.entity({
      amount: i.number(),
      category: i.string(),
      name: i.string(),
      transactionAt: i.date().indexed(),
      type: i.string().indexed(),
    }),
  },
  links: {
    accountsUser: {
      forward: {
        on: "accounts",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "accounts",
      },
    },
    transactionsAccount: {
      forward: {
        on: "transactions",
        has: "one",
        label: "account",
        onDelete: "cascade",
      },
      reverse: {
        on: "accounts",
        has: "many",
        label: "transactions",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
