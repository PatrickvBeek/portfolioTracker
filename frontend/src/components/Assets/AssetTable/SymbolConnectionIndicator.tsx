import { useCurrentPrice } from "../../../hooks/prices/priceHooks";
import { cn } from "../../../utility/cn";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import { Link2, Link2Off } from "lucide-react";

type SymbolConnectionIndicatorProps = {
  symbol: string;
};

export function SymbolConnectionIndicator({
  symbol,
}: SymbolConnectionIndicatorProps) {
  const priceQuery = useCurrentPrice(symbol);

  if (priceQuery.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-text">{symbol}</span>
        <LoadingIndicator />
      </div>
    );
  }

  const isConnected = priceQuery.isSuccess;

  return (
    <div className="flex items-center gap-2">
      <span className="text-text">{symbol}</span>
      <div
        className={cn(
          "relative flex items-center justify-center w-5 h-5 rounded-full",
          isConnected ? "text-success" : "text-danger"
        )}
      >
        {isConnected ? (
          <Link2 className="w-4 h-4" />
        ) : (
          <Link2Off className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
