import { ReactElement } from "react";
import { cn } from "../../../utility/cn";
import { toPrice } from "../../../utility/prices";

type BalanceProps = { value: number; suffix?: string };

function Balance({ value }: BalanceProps): ReactElement {
  const displayNumber = Number(value.toFixed(2));
  const sign =
    displayNumber === 0 ? "" : displayNumber > 0 ? "positive" : "negative";
  return (
    <div
      className={cn(
        sign === "positive" && "text-success",
        sign === "negative" && "text-danger"
      )}
    >{`${sign === "positive" ? "+" : ""}${toPrice(value)}`}</div>
  );
}

export default Balance;
