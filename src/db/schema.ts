import { uuid, text, pgTable, timestamp, pgEnum, index, real } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from 'uuid';
import { currencies } from "./currencies";
import { relations } from "drizzle-orm";


export const currencyEnum = pgEnum("currency", currencies);
export const account = pgTable("account", {
  id: uuid().primaryKey().$defaultFn(() => uuidv7()),
  name: text().notNull(),
  currency: currencyEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const accountRelations = relations(account, ({ many }) => ({
  transactions: many(transaction, {
    relationName: "transactions",
  }),
}));

export const typeEnum = pgEnum("type", ["credit", "debit"]);
export const transaction = pgTable("transaction", {
  id: uuid().primaryKey().$defaultFn(() => uuidv7()),
  accountId: uuid("account_id").notNull().references(() => account.id, { onDelete: "cascade" }),
  name: text().notNull(),
  amount: real().notNull(),
  type: typeEnum().notNull(),
  category: text().notNull(),
  transactionAt: timestamp("transaction_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
},(table => [
  index('account_id_idx').on(table.accountId),
  index('type_idx').on(table.type),
  index('category_idx').on(table.category),
]));

export const transactionRelations = relations(transaction, ({ one }) => ({
  account: one(account, {
    fields: [transaction.accountId],
    references: [account.id],
    relationName: "account",
  }),
}));
