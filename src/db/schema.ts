import { uuid, text, pgTable, timestamp, pgEnum, index, real } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from 'uuid';
import { currencies } from "./currencies";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export * from "./auth-schema";


export const userRelations = relations(user, ({ many }) => ({
  accounts: many(transactionAccount, {
    relationName: "accounts",
  }),
}));
export const currencyEnum = pgEnum("currency", currencies);
export const transactionAccount = pgTable("transaction_account", {
  id: uuid().primaryKey().$defaultFn(() => uuidv7()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  currency: currencyEnum().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const transactionAccountRelations = relations(transactionAccount, ({ many, one }) => ({
  transactions: many(transaction, {
    relationName: "transactions",
  }),
  user:  one(user, {
    fields: [transactionAccount.userId],
    references: [user.id],
    relationName: "user",
  }),
}));

export const typeEnum = pgEnum("type", ["credit", "debit"]);
export const transaction = pgTable("transaction", {
  id: uuid().primaryKey().$defaultFn(() => uuidv7()),
  accountId: uuid("account_id").notNull().references(() => transactionAccount.id, { onDelete: "cascade" }),
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
  account: one(transactionAccount, {
    fields: [transaction.accountId],
    references: [transactionAccount.id],
    relationName: "account",
  }),
}));
