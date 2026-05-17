import { ReactElement, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { useAddOrderToPortfolio } from "../../../hooks/portfolios/portfolioHooks";
import { isNotNil } from "../../../utility/types";
import AssetDropdown from "../../Assets/AssetDropdown/AssetSelect";
import { Button } from "../../ui/Button";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { DateInput, DateInputValue } from "../../ui/DateInput";
import { NumberInput, NumberInputValue } from "../../ui/NumberInput";
import { useOrderValidation } from "./OrderInputForm.logic";
import { styles } from "./OrderInputForm.styles";

export type OrderInputFormProps = {
  portfolioName: string;
};

const DEFAULTS = {
  isin: "",
  pieces: undefined,
  sharePrice: undefined,
  fees: 0,
  taxes: 0,
  date: new Date(),
};

export function OrderInputForm({
  portfolioName,
}: OrderInputFormProps): ReactElement {
  const [isin, setAssetIsin] = useState(DEFAULTS.isin);
  const [pieces, setPieces] = useState<NumberInputValue>(DEFAULTS.pieces);
  const [sharePrice, setSharePrice] = useState<NumberInputValue>(
    DEFAULTS.sharePrice
  );
  const [fees, setFees] = useState<NumberInputValue>(DEFAULTS.fees);
  const [taxes, setTaxes] = useState<NumberInputValue>(DEFAULTS.taxes);
  const [date, setDate] = useState<DateInputValue>(DEFAULTS.date);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const { isValid, isDuplicate } = useOrderValidation(portfolioName);
  const addOrder = useAddOrderToPortfolio(portfolioName);

  const isFormValid = isin && pieces && pieces !== 0 && sharePrice && date;

  const orderToSubmit = isFormValid
    ? {
        sharePrice: sharePrice,
        asset: isin,
        orderFee: fees || 0,
        pieces: pieces,
        timestamp: date.toISOString(),
        taxes: taxes || 0,
        uuid: uuidV4(),
      }
    : undefined;

  const submitHandler = () => {
    if (isDuplicate(orderToSubmit)) {
      setIsWarningOpen(true);
    } else if (orderToSubmit) {
      addOrder(orderToSubmit);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1">
        <AssetDropdown
          onChange={(isin) => setAssetIsin(isin || DEFAULTS.isin)}
          label="Asset"
          isMandatory={true}
        />
      </div>
      <DateInput
        onChange={setDate}
        label={"Order Date"}
        defaultDate={DEFAULTS.date}
        isMandatory={true}
      />
      <NumberInput
        onChange={setPieces}
        label={"Pieces"}
        defaultValue={DEFAULTS.pieces}
        isMandatory={true}
        autoComplete={"off"}
      />
      <NumberInput
        onChange={setSharePrice}
        label={"Share Price"}
        defaultValue={DEFAULTS.sharePrice}
        isMandatory={true}
        autoComplete={"off"}
      />
      <NumberInput
        onChange={setFees}
        label={"Fees"}
        defaultValue={DEFAULTS.fees}
        isMandatory={false}
        autoComplete={"off"}
      />
      <NumberInput
        onChange={setTaxes}
        label={"Taxes"}
        defaultValue={DEFAULTS.taxes}
        isMandatory={false}
        autoComplete={"off"}
      />
      <div className={styles.summary}>
        Summary:
        <div className={styles.calculation} title="Summary Text">
          {getOrderSummaryText({ pieces, sharePrice, fees })}
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={submitHandler}
        disabled={!isFormValid || !isValid(orderToSubmit)}
      >
        Submit
      </Button>
      <ConfirmationDialog
        open={isWarningOpen}
        onCancel={() => setIsWarningOpen(false)}
        title="Duplicate Order Detected!"
        body={
          <>
            <p>
              This order seems to be a duplicate of an already registered order
              for this portfolio. All values are equal.
            </p>
            <p>Do you still want to add this order?</p>
          </>
        }
        confirmLabel="Add anyway"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (orderToSubmit) {
            addOrder(orderToSubmit);
          }
          setIsWarningOpen(false);
        }}
      />
    </div>
  );
}

function getOrderSummaryText({
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
