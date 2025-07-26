import type { account, transaction } from "./schema";

export type AccountInsert = typeof account.$inferInsert;
export type AccountSelect = typeof account.$inferSelect;


export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;