import type { Database } from "./database.types";

type Transaction = Database["public"]["Tables"]["transaction"]["Row"];

export function generateMockTransactions(
  count: number,
  options?: {
    startDate?: Date;
    endDate?: Date;
    accountId?: string;
    minAmount?: number;
    maxAmount?: number;
  },
): Transaction[] {
  const {
    startDate = new Date(2024, 0, 1), // Default to Jan 1, 2024
    endDate = new Date(),
    accountId = "mock-account-id",
    minAmount = -1000,
    maxAmount = 1000,
  } = options ?? {};

  const transactions: Transaction[] = [];
  const timeRange = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    // Generate random date between start and end
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const transactionDate = new Date(randomTime);

    // Generate random amount between min and max
    const amount =
      Math.floor(Math.random() * (maxAmount - minAmount)) + minAmount;

    transactions.push({
      id: `mock-transaction-${i}`,
      account_id: accountId,
      amount,
      category: amount > 0 ? "Income" : "Expense",
      name: amount > 0 ? "Mock Income" : "Mock Expense",
      transaction_at: transactionDate.toISOString(),
      transaction_type: amount > 0 ? "credit" : "debit",
      created_at: transactionDate.toISOString(),
      updated_at: transactionDate.toISOString(),
      deleted: false,
    });
  }

  // Sort by transaction date
  return transactions.sort(
    (a, b) =>
      new Date(a.transaction_at).getTime() -
      new Date(b.transaction_at).getTime(),
  );
}
