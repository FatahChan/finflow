export function Money({
  amount,
  currency,
  positive,
}: {
  amount: number;
  currency: string;
  positive?: boolean;
}) {
  return (
    <p
      className={`font-semibold uppercase ${
        positive ? "text-secondary" : "text-destructive"
      }`}
    >
      {`${positive ? "+" : "-"} ${Math.abs(amount).toFixed(2)} ${currency}`}
    </p>
  );
}
