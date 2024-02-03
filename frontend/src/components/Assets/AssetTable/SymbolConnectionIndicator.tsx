import { ReactElement } from "react";
import {
  PRICE_FREQUENCY,
  useFetchPrices,
} from "../../../hooks/prices/priceHooks";
import { Props } from "../../../utility/types";
import "./SymbolConnectionIndicator.css";

type SymbolConnectionIndicatorProps = Props<{
  symbol: string;
}>;

export function SymbolConnectionIndicator({
  symbol,
}: SymbolConnectionIndicatorProps): ReactElement {
  const priceQuery = useFetchPrices({
    symbol,
    frequency: PRICE_FREQUENCY.DAILY,
  });

  if (priceQuery.isLoading) {
    return <i className="fa fa-duotone fa-spinner fa-spin" />;
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
