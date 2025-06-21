import { Stack } from "@mui/material";
import { ReactElement, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { useAddOrderToPortfolio } from "../../../hooks/portfolios/portfolioHooks";
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
import { useOrderValidation } from "./OrderInputForm.logic";

const { bemElement } = bemHelper("order-input-form");

export type OrderInputFormProps = Props<{
  portfolioName: string;
}>;

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
        sharePrice: Number(sharePrice),
        asset: isin,
        orderFee: Number(fees) || 0,
        pieces: Number(pieces),
        timestamp: date.toISOString(),
        taxes: Number(taxes) || 0,
        uuid: uuidV4(),
      }
    : undefined;

  const submitHandler = () => {
    if (isDuplicate(orderToSubmit)) {
      setIsWarningOpen(true);
    } else {
      orderToSubmit && addOrder(orderToSubmit);
    }
  };

  return (
    <Stack>
      <AssetDropdown
        className={bemElement("asset")}
        onChange={(isin) => setAssetIsin(isin || DEFAULTS.isin)}
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
        defaultValue={DEFAULTS.sharePrice}
        isMandatory={true}
        autoComplete={"off"}
      />
      <NumberInput
        className={bemElement("fees")}
        onChange={setFees}
        label={"Fees"}
        defaultValue={DEFAULTS.fees}
        isMandatory={false}
        autoComplete={"off"}
      />
      <NumberInput
        className={bemElement("taxes")}
        onChange={setTaxes}
        label={"Taxes"}
        defaultValue={DEFAULTS.taxes}
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
          {getOrderSummaryText({ pieces, sharePrice, fees })}
        </div>
      </div>
      <Button
        sx={{ marginTop: "1rem" }}
        className={bemElement("button")}
        onClick={submitHandler}
        label={"Submit"}
        isDisabled={!isFormValid || !isValid(orderToSubmit)}
        isPrimary={true}
      />
      {isWarningOpen && (
        <DuplicationWarning
          onCancel={() => setIsWarningOpen(false)}
          onConfirm={() => {
            orderToSubmit && addOrder(orderToSubmit);
            setIsWarningOpen(false);
          }}
        />
      )}
    </Stack>
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

type DuplicationWarningProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function DuplicationWarning({ onCancel, onConfirm }: DuplicationWarningProps) {
  return (
    <Confirmation
      title={"Duplicate Order Detected!"}
      body={
        <>
          <p>
            This order seems to be a duplicate of an already registered order
            for this portfolio. All values are equal.
          </p>
          <p>Do you still want to add this order?</p>
        </>
      }
      confirmLabel={"Add anyway"}
      cancelLabel={"Cancel"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
