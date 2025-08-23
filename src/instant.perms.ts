// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  attrs: {
    allow: {
      $default: "false",
    },
  },
  accounts: {
    bind: [
      "isOwner",
      "auth.id != null && data.ref('user.id') == auth.ref('$user.id')",
      "isSameUser",
      "newData.user == data.user",
    ],
    allow: {
      view: "isOwner",
      create: "isOwner",
      delete: "isOwner",
      update: "isOwner && isSameUser",
    },
  },
  transactions: {
    bind: [
      "isOwner",
      "auth.id != null && data.ref('account.user.id') == auth.ref('$user.id')",
      "isSameAccount",
      "newData.account == data.account",
    ],
    allow: {
      view: "isOwner",
      create: "isOwner",
      delete: "isOwner",
      update: "isOwner && isSameAccount",
    },
  },
} satisfies InstantRules;

export default rules;
