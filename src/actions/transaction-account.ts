import { db } from "@/db/drizzle";
import { transactionAccount } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import type { TransactionAccountInsert } from "@/db/type";
import { authMiddleware } from "@/middleware/auth";

export const createAccount = createServerFn()
  .middleware([authMiddleware])
  .validator((data: TransactionAccountInsert) => {
    return data as TransactionAccountInsert;
  })
  .handler(async ({ data: { name, currency }, context: { user } }) => {
    const createdAccount = await db
      .insert(transactionAccount)
      .values({ name, currency, userId: user.id });
    return createdAccount;
  });

export const getAccountById = createServerFn()
  .middleware([authMiddleware])
  .validator((data: TransactionAccountInsert) => {
    if (!data.id) {
      throw new Error("Account id is required");
    }
    return data as TransactionAccountInsert & { id: string };
  })
  .handler(async ({ data: { id }, context: { user } }) => {
    return await db
      .select()
      .from(transactionAccount)
      .where(and(eq(transactionAccount.id, id), eq(transactionAccount.userId, user.id)));
  });

export const getAccounts = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({context:{user}}) => {
  const accounts = await db.query.transactionAccount.findMany({
    where: (account, { eq }) => eq(account.userId, user.id),
    orderBy: (account, { desc }) => [desc(account.createdAt)],
  });
  return accounts;
});

export const updateAccount = createServerFn()
  .middleware([authMiddleware])
  .validator((data: Partial<TransactionAccountInsert>) => {
    if (!data.id) {
      throw new Error("Account id is required");
    }
    return data as TransactionAccountInsert & { id: string };
  })
  .handler(async ({ data: { name, currency, id }, context: { user } }) => {
    const updatedAccount = await db
      .update(transactionAccount)
      .set({ name, currency })
      .where(and(eq(transactionAccount.id, id), eq(transactionAccount.userId, user.id)));
    return updatedAccount;
  });

export const deleteAccount = createServerFn()
  .middleware([authMiddleware])
  .validator((data: Partial<TransactionAccountInsert>) => {
    if (!data.id) {
      throw new Error("Account id is required");
    }
    return data as TransactionAccountInsert & { id: string };
  })
  .handler(async ({ data: { id }, context: { user } }) => {
    const deletedAccount = await db
      .delete(transactionAccount)
      .where(and(eq(transactionAccount.id, id), eq(transactionAccount.userId, user.id)));
    return deletedAccount;
  });
