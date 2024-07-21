import { ReactElement } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import "./Balance.css";

const { bemBlock } = bemHelper("balance");

type BalanceProps = Props<{ value: number; suffix?: string }>;

function Balance({ className, value }: BalanceProps): ReactElement {
  const displayNumber = Number(value.toFixed(2));
  const sign =
    displayNumber === 0 ? "" : displayNumber > 0 ? "positive" : "negative";
  return (
    <div className={bemBlock(className, sign)}>{`${
      sign === "positive" ? "+" : ""
    }${toPrice(value)}`}</div>
  );
}

export default Balance;
