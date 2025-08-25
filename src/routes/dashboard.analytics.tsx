import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Header } from "@/components/header";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { Money } from "@/components/ui/money";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { db } from "@/lib/instant-db";
import { accountsQuery, transactionsWithAccountQuery } from "@/instant.queries";
import { use$ } from "@legendapp/state/react";
import { currencies$, defaultCurrency$ } from "@/lib/legend-state";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      {
        title: "Analytics | FinFlow",
      },
    ],
  }),
});

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AnalyticsPage() {
  const [filters, setFilters] = useState({
    account: "all",
    period: "6months",
    type: "all",
  });

  const { data } = db.useQuery({
    ...transactionsWithAccountQuery,
    ...accountsQuery,
  });

  const transactions = useMemo(
    () => data?.transactions || [],
    [data?.transactions]
  );
  const accounts = data?.accounts || [];
  const defaultCurrency = use$(defaultCurrency$.get());
  const exchangeRates = use$(currencies$.exchangeRates.get());

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by account
    if (filters.account !== "all") {
      filtered = filtered.filter((t) => t.account?.id === filters.account);
    }

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by time period
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    filtered = filtered.filter((t) => new Date(t.transactionAt) >= startDate);

    return filtered;
  }, [transactions, filters]);

  // Convert amounts to default currency
  const convertAmount = useCallback(
    (amount: number, currency: string) => {
      if (currency === defaultCurrency) return amount;
      return (
        amount * (exchangeRates[currency as keyof typeof exchangeRates] || 1)
      );
    },
    [defaultCurrency, exchangeRates]
  );

  // Monthly Income vs Expenses Chart Data
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.transactionAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      const amount = convertAmount(
        transaction.amount,
        transaction.account?.currency || defaultCurrency
      );

      if (transaction.type === "credit") {
        data.income += amount;
      } else {
        data.expenses += amount;
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
      }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      );
  }, [filteredTransactions, convertAmount, defaultCurrency]);

  // Category breakdown for expenses
  const expenseCategoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredTransactions
      .filter((t) => t.type === "debit")
      .forEach((transaction) => {
        const amount = convertAmount(
          transaction.amount,
          transaction.account?.currency || defaultCurrency
        );
        categoryMap.set(
          transaction.category,
          (categoryMap.get(transaction.category) || 0) + amount
        );
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions, convertAmount, defaultCurrency]);

  // Category breakdown for income
  const incomeCategoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredTransactions
      .filter((t) => t.type === "credit")
      .forEach((transaction) => {
        const amount = convertAmount(
          transaction.amount,
          transaction.account?.currency || defaultCurrency
        );
        categoryMap.set(
          transaction.category,
          (categoryMap.get(transaction.category) || 0) + amount
        );
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions, convertAmount, defaultCurrency]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "credit")
      .reduce(
        (sum, t) =>
          sum + convertAmount(t.amount, t.account?.currency || defaultCurrency),
        0
      );

    const totalExpenses = filteredTransactions
      .filter((t) => t.type === "debit")
      .reduce(
        (sum, t) =>
          sum + convertAmount(t.amount, t.account?.currency || defaultCurrency),
        0
      );

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome: Math.round((totalIncome - totalExpenses) * 100) / 100,
    };
  }, [filteredTransactions, convertAmount, defaultCurrency]);

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-20 ">
      {/* Header */}
      <Header title="Analytics" backButton actions={<NavigationDrawer />} />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-card border-b">
        <NativeSelect
          value={filters.account}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, account: e.target.value }))
          }
          className="w-full text-sm"
        >
          <option value="all">All Accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={filters.period}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, period: e.target.value }))
          }
          className="w-full  text-sm"
        >
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
        </NativeSelect>

        <NativeSelect
          value={filters.type}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, type: e.target.value }))
          }
          className="w-full text-sm"
        >
          <option value="all">All Types</option>
          <option value="credit">Income</option>
          <option value="debit">Expenses</option>
        </NativeSelect>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <Money
                    amount={summary.totalIncome}
                    currency={defaultCurrency}
                    positive={true}
                    className="text-sm text-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <Money
                    amount={summary.totalExpenses}
                    currency={defaultCurrency}
                    positive={false}
                    className="text-sm text-red-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <Money
                    amount={summary.netIncome}
                    currency={defaultCurrency}
                    positive={summary.netIncome >= 0}
                    className={`text-sm ${
                      summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Monthly Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Monthly Income vs Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-hidden">
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] sm:h-[300px] w-full"
                >
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} tickMargin={8} width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="income" fill="var(--color-income)" />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Categories */}
            {expenseCategoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Expense Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full overflow-hidden">
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <Pie
                            data={expenseCategoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            dataKey="amount"
                          >
                            {expenseCategoryData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                                    <p className="font-medium">{data.category}</p>
                                    <Money
                                      amount={data.amount}
                                      currency={defaultCurrency}
                                      positive={false}
                                      className="text-sm"
                                    />
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Legend */}
                  <div className="mt-4 space-y-2">
                    {expenseCategoryData.slice(0, 4).map((item, index) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-sm truncate">{item.category}</span>
                        </div>
                        <Money
                          amount={item.amount}
                          currency={defaultCurrency}
                          positive={false}
                          className="text-xs ml-2 flex-shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Income Categories */}
            {incomeCategoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Income Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full overflow-hidden">
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <Pie
                            data={incomeCategoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            dataKey="amount"
                          >
                            {incomeCategoryData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                                    <p className="font-medium">{data.category}</p>
                                    <Money
                                      amount={data.amount}
                                      currency={defaultCurrency}
                                      positive={true}
                                      className="text-sm"
                                    />
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Legend */}
                  <div className="mt-4 space-y-2">
                    {incomeCategoryData.slice(0, 4).map((item, index) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-sm truncate">{item.category}</span>
                        </div>
                        <Money
                          amount={item.amount}
                          currency={defaultCurrency}
                          positive={true}
                          className="text-xs ml-2 flex-shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
