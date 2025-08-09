import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/drizzle";
import { transaction, transactionAccount } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { TransactionInsert } from "@/db/type";
import { authMiddleware } from "@/middleware/auth";

export const createTransaction = createServerFn()
  .middleware([authMiddleware])
  .validator((data: TransactionInsert) => {
    return data as TransactionInsert;
  })
  .handler(
    async ({
      data: { name, accountId, amount, category, type, transactionAt },
      context: { user },
    }) => {
      const account = await db.query.transactionAccount.findFirst({
        where: (account, { eq, and }) =>
          and(eq(account.id, accountId), eq(account.userId, user.id)),
      });

      if (!account) {
        throw new Error("Account not found");
      }

      const createdTransaction = await db
        .insert(transaction)
        .values({ name, accountId, amount, category, type, transactionAt });
      return createdTransaction;
    }
  );

export const getTransactions = createServerFn()
  .middleware([authMiddleware])
  .validator((data?: TransactionInsert) => {
    return data ?? ({} as { accountId?: string; type?: "credit" | "debit" });
  })
  .handler(async ({ data: { accountId, type }, context: { user } }) => {
    const transactions = db
      .select({
        id: transaction.id,
        accountId: transaction.accountId,
        name: transaction.name,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        transactionAt: transaction.transactionAt,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })
      .from(transaction)
      .innerJoin(
        transactionAccount,
        eq(transaction.accountId, transactionAccount.id)
      );

    if (accountId && type) {
      return await transactions
        .where(
          and(
            eq(transactionAccount.userId, user.id),
            eq(transaction.type, type),
            eq(transaction.accountId, accountId)
          )
        )
        .execute();
    }
    if (accountId) {
      return await transactions
        .where(
          and(
            eq(transactionAccount.userId, user.id),
            eq(transaction.accountId, accountId)
          )
        )
        .execute();
    }
    if (type) {
      return await transactions
        .where(
          and(
            eq(transactionAccount.userId, user.id),
            eq(transaction.type, type)
          )
        )
        .execute();
    }
    return await transactions.execute();
  });

export const updateTransaction = createServerFn()
  .middleware([authMiddleware])
  .validator((data: Partial<TransactionInsert>) => {
    if (!data.id) {
      throw new Error("Transaction id is required");
    }
    return data as TransactionInsert & { id: string };
  })
  .handler(
    async ({
      data: { name, accountId, amount, category, type, transactionAt, id },
    }) => {
      const transactionToUpdate = await db
        .select()
        .from(transaction)
        .innerJoin(
          transactionAccount,
          eq(transaction.accountId, transactionAccount.id)
        )
        .where(and(eq(transaction.id, id), eq(transactionAccount.userId, id)))
        .limit(1);
        
      if (transactionToUpdate.length === 0) {
        throw new Error("Transaction not found or not authorized");
      }

      const updatedTransaction = await db
        .update(transaction)
        .set({ name, accountId, amount, category, type, transactionAt })
        .where(eq(transaction.id, id));
      return updatedTransaction;
    }
  );

export const deleteTransaction = createServerFn()
  .middleware([authMiddleware])
  .validator((data: {id: string}) => {
    if (!data.id) {
      throw new Error("Transaction id is required");
    }
    return data as { id: string };
  })
  .handler(async ({ data: { id } }) => {

    const transactionToDelete = await db
    .select()
    .from(transaction)
    .innerJoin(
      transactionAccount,
      eq(transaction.accountId, transactionAccount.id)
    )
    .where(and(eq(transaction.id, id), eq(transactionAccount.userId, id)))
    .limit(1);
    
  if (transactionToDelete.length === 0) {
    throw new Error("Transaction not found or not authorized");
  }
    const deletedTransaction = await db
      .delete(transaction)
      .where(eq(transaction.id, id));
    return deletedTransaction;
  });
