import { cn } from "@/lib/utils";

export function Money({
  amount,
  currency,
  positive,
  className,
}: {
  amount: number;
  currency: string;
  positive?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-semibold uppercase",
        positive ? "text-secondary" : "text-destructive",
        className
      )}
    >
      {`${positive ? "+" : "-"} ${Math.abs(amount).toFixed(2)} ${currency}`}
    </p>
  );
}
