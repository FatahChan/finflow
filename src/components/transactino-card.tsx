import { useAccountByIdQuery } from "@/hooks/queries";
import type { Database } from "@/lib/database.types";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

export function TransactionCard({
  transaction,
}: { transaction: Database["public"]["Tables"]["transaction"]["Row"] }) {
  const { amount, transaction_type, account_id, name, category, created_at } =
    transaction;
  const { data: account, isPending } = useAccountByIdQuery(account_id);

  if (isPending) return null;
  return (
    <Card className="gap-2 overflow-hidden py-2">
      <CardHeader className="flex items-center px-2">
        <div
          className={cn(
            "flex h-10 min-w-10 items-center justify-center rounded-full",
            transaction_type === "credit" ? "bg-green-100" : "bg-red-100",
          )}
        >
          {transaction_type === "credit" ? (
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        {name}
        <div
          className={cn(
            "flex-1 text-end font-medium",
            transaction_type === "credit" ? "text-green-600" : "text-red-600",
          )}
        >
          {formatCurrency(amount, account?.currency_code || "")}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center px-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>{category}</span>|
            <span>{new Date(created_at).toLocaleDateString("en-GB")}</span>|
            <span>
              {account?.name} ({account?.currency_code})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
