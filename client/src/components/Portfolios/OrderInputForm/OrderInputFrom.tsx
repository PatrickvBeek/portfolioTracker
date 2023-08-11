import { sum } from "radash";
import { ReactElement, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { portfolioContainsOrder } from "../../../domain/portfolio/portfolio.derivers";
import { getPositions } from "../../../domain/position/position.derivers";
import {
  useAddOrderToPortfolio,
  useGetPortfolio,
} from "../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../utility/bemHelper";
import { Props, isNotNil } from "../../../utility/types";
import AssetDropdown from "../../Assets/AssetDropdown/AssetSelect";
import { Button } from "../../general/Button";
import Confirmation from "../../general/Confirmation/Confirmation";
import { DateInput, DateInputValue } from "../../general/DateInput";
import {
  NumberInput,
  NumberInputValue,
} from "../../general/NumberInput/NumberInput";
import "./OrderInputForm.css";

const { bemBlock, bemElement } = bemHelper("order-input-form");

export type OrderInputFormProps = Props<{
  portfolioName: string;
  shape?: "column" | "regular";
}>;

const DEFAULTS = {
  isin: "",
  pieces: undefined,
  sharePrice: undefined,
  fees: 0,
  date: new Date(),
};

export function OrderInputForm({
  className,
  portfolioName,
  shape = "regular",
}: OrderInputFormProps): ReactElement | null {
  const portfolioResponse = useGetPortfolio(portfolioName);
  const addOrder = useAddOrderToPortfolio(portfolioName).mutate;
  const [isin, setAssetIsin] = useState(DEFAULTS.isin);
  const [pieces, setPieces] = useState<NumberInputValue>(DEFAULTS.pieces);
  const [sharePrice, setSharePrice] = useState<NumberInputValue>(
    DEFAULTS.sharePrice
  );
  const [fees, setFees] = useState<NumberInputValue>(DEFAULTS.fees);
  const [date, setDate] = useState<DateInputValue>(DEFAULTS.date);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  if (!portfolioResponse.data) {
    return null;
  }

  const portfolio = portfolioResponse.data;

  const isFormValid = isin && pieces && pieces !== 0 && sharePrice && date;

  const isOrderValid =
    pieces &&
    (sum(
      getPositions(portfolio.orders[isin])?.open || [],
      (pos) => pos.pieces
    ) || 0) +
      pieces >=
      0;

  const orderToSubmit = isFormValid
    ? {
        sharePrice: Number(sharePrice),
        asset: isin,
        orderFee: Number(fees),
        pieces: Number(pieces),
        timestamp: date.toISOString(),
        uuid: uuidV4(),
      }
    : undefined;

  const submitHandler = () => {
    const isDuplicate = orderToSubmit
      ? portfolioContainsOrder(portfolio, orderToSubmit)
      : false;
    if (isDuplicate) {
      setIsConfirmationOpen(true);
    } else {
      orderToSubmit && addOrder(orderToSubmit);
    }
  };

  return (
    <div
      className={bemBlock(className, { [shape]: true })}
      data-testid={"order-input-form"}
    >
      <AssetDropdown
        className={bemElement("asset")}
        onSelect={setAssetIsin}
        isMandatory={true}
      />
      <NumberInput
        className={bemElement("pieces")}
        onChange={setPieces}
        label={"Pieces"}
        defaultValue={DEFAULTS.pieces}
        isMandatory={true}
        autoComplete={"off"}
      />
      <NumberInput
        className={bemElement("sharePrice")}
        onChange={setSharePrice}
        label={"Share Price"}
        digits={2}
        defaultValue={DEFAULTS.sharePrice}
        isMandatory={true}
        autoComplete={"off"}
      />
      <NumberInput
        className={bemElement("fees")}
        onChange={setFees}
        label={"Fees"}
        digits={2}
        defaultValue={DEFAULTS.fees}
        isMandatory={false}
        autoComplete={"off"}
      />
      <DateInput
        className={bemElement("date")}
        onChange={setDate}
        label={"Order Date"}
        defaultDate={DEFAULTS.date}
        isMandatory={true}
      />
      <div className={bemElement("summary")}>
        Summary:
        <div className={bemElement("calculation")} title="Summary Text">
          {getCalculationText({ pieces, sharePrice, fees })}
        </div>
      </div>
      <Button
        className={bemElement("button")}
        onClick={submitHandler}
        label={"Submit"}
        isDisabled={!isFormValid || !isOrderValid}
        isPrimary={true}
      />
      {isConfirmationOpen && (
        <Confirmation
          title={"Duplicate Order Detected!"}
          body={
            <>
              <p>
                This order seems to be a duplicate of an already registered
                order for this portfolio. All values are equal.
              </p>
              <p>Do you still want to add this order?</p>
            </>
          }
          confirmLabel={"Add anyway"}
          cancelLabel={"Cancel"}
          onConfirm={() => {
            orderToSubmit && addOrder(orderToSubmit);
            setIsConfirmationOpen(false);
          }}
          onCancel={() => setIsConfirmationOpen(false)}
        />
      )}
    </div>
  );
}

function getCalculationText({
  pieces,
  sharePrice,
  fees,
}: {
  pieces: NumberInputValue;
  sharePrice: NumberInputValue;
  fees: NumberInputValue;
}): string {
  if (isNotNil(pieces) && isNotNil(sharePrice) && isNotNil(fees)) {
    return `${pieces} x ${sharePrice} + ${fees} = ${(
      pieces * sharePrice +
      fees
    ).toFixed(2)}`;
  }
  return "undetermined";
}
