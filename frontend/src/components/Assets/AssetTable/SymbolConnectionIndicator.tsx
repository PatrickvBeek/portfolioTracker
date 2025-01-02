import { ReactElement } from "react";
import { useCurrentPrice } from "../../../hooks/prices/priceHooks";
import { Props } from "../../../utility/types";
import { LoadingIndicator } from "../../general/LoadingIndicator/LoadingIndicator";
import "./SymbolConnectionIndicator.css";

type SymbolConnectionIndicatorProps = Props<{
  symbol: string;
}>;

export function SymbolConnectionIndicator({
  symbol,
}: SymbolConnectionIndicatorProps): ReactElement {
  const priceQuery = useCurrentPrice(symbol);

  if (priceQuery.isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className={"symbol-connection-indicator"}>
      {symbol}
      <i
        className={`fa fa-link${
          priceQuery.isSuccess ? "" : "-slash"
        } fa-duotone`}
      />
    </div>
  );
}
