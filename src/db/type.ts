import type { transactionAccount, transaction } from "./schema";

export type TransactionAccountInsert = typeof transactionAccount.$inferInsert;
export type TransactionAccountSelect = typeof transactionAccount.$inferSelect;


export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;