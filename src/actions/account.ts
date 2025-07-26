import { db } from "@/db/drizzle";
import { account } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import type { AccountInsert } from "@/db/type";

export const createAccount = createServerFn().validator((data: AccountInsert) => {
    return data as AccountInsert;
}).handler(async ({ data: { name, currency } }) => {
    const createdAccount = await db.insert(account).values({ name, currency });
    return createdAccount;
});

export const getAccountById = createServerFn().validator((data: AccountInsert) => {
    if (!data.id) {
        throw new Error("Account id is required");
    }
    return data as AccountInsert & { id: string };
}).handler(async ({ data: { id } }) => {
    return await db.select().from(account).where(eq(account.id, id));
});

export const getAccounts = createServerFn().handler(async () => {
  const accounts = await db.query.account.findMany({
    orderBy: (account, { desc }) => [desc(account.createdAt)],
  });
  return accounts;
});

export const updateAccount = createServerFn()
  .validator((data: Partial<AccountInsert>) => {
    if (!data.id) {
      throw new Error("Account id is required");
    }
    return data as AccountInsert & { id: string };
  })
  .handler(async ({ data: { name, currency, id } }) => {
    const updatedAccount = await db
      .update(account)
      .set({ name, currency })
      .where(eq(account.id, id));
    return updatedAccount;
  });

export const deleteAccount = createServerFn().validator((data: Partial<AccountInsert>) => {
    if (!data.id) {
        throw new Error("Account id is required");
    }
    return data as AccountInsert & { id: string };
}).handler(async ({ data: { id } }) => {
    const deletedAccount = await db.delete(account).where(eq(account.id, id));
    return deletedAccount;
});