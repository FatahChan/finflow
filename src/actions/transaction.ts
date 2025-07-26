import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/drizzle";
import { transaction } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { TransactionInsert } from "@/db/type";

export const createTransaction = createServerFn()
  .validator((data: TransactionInsert) => {
    return data as TransactionInsert;
  })
  .handler(
    async ({
      data: { name, accountId, amount, category, type, transactionAt },
    }) => {
      const createdTransaction = await db
        .insert(transaction)
        .values({ name, accountId, amount, category, type, transactionAt });
      return createdTransaction;
    }
  );

export const getTransactions = createServerFn().validator((data?: TransactionInsert) => {
    return data ?? 
    {} as { accountId?: string, type?: "credit" | "debit" };
}).handler(async ({ data: { accountId, type } }) => {

    if (accountId && type) {
        const transactions = await db.query.transaction.findMany({
            where: and(eq(transaction.accountId, accountId), eq(transaction.type, type))
        });
        return transactions;
    }
    if (accountId) {
        const transactions = await db.query.transaction.findMany({
            where: eq(transaction.accountId, accountId)
        });
        return transactions;
    }
    if (type) {
        const transactions = await db.query.transaction.findMany({
            where: eq(transaction.type, type)
        });
        return transactions;
    }
    const transactions = await db.query.transaction.findMany();
    return transactions;
});

export const updateTransaction = createServerFn()
  .validator((data: Partial<TransactionInsert>) => {
    if (!data.id) {
      throw new Error("Transaction id is required");
    }
    return data as TransactionInsert & { id: string };
  })
  .handler(async ({ data: { name, accountId, amount, category, type, transactionAt, id } }) => {
    const updatedTransaction = await db
      .update(transaction)
      .set({ name, accountId, amount, category, type, transactionAt })
      .where(eq(transaction.id, id));
    return updatedTransaction;
  });

export const deleteTransaction = createServerFn().validator((data: TransactionInsert) => {
    if (!data.id) {
      throw new Error("Transaction id is required");
    }
    return data as TransactionInsert & { id: string };
}).handler(async ({ data: { id } }) => {
    const deletedTransaction = await db.delete(transaction).where(eq(transaction.id, id));
    return deletedTransaction;
});