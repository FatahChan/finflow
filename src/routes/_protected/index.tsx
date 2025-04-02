import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEstTotalBalance } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  staticData: {
    crumb: "Home",
  },
  component: Home,
});

function Home() {
  const { isPending, data: estTotalBalance } = useEstTotalBalance();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-semibold text-gray-900 text-xl">
            Total Estimated Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {isPending && estTotalBalance !== undefined ? (
            <div className="font-bold text-3xl text-primary">
              {formatCurrency(estTotalBalance, "USD")}
            </div>
          ) : (
            <Skeleton className="h-9 w-48" />
          )}
        </CardContent>
      </Card>
      <Button asChild className="w-full" size="lg">
        <Link to="/account">View All Accounts</Link>
      </Button>
    </div>
  );
}
