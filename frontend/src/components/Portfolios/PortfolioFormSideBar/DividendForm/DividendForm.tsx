import { DividendPayout } from "pt-domain";
import { ReactElement, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAddDividendPayoutToPortfolio } from "../../../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../../../utility/bemHelper";
import { Props } from "../../../../utility/types";
import AssetDropdown from "../../../Assets/AssetDropdown/AssetSelect";
import { Button } from "../../../general/Button";
import { DateInput, DateInputValue } from "../../../general/DateInput";
import {
  NumberInput,
  NumberInputValue,
} from "../../../general/NumberInput/NumberInput";
import "./DividendForm.css";

type DividendFormProps = Props<{
  portfolioName: string;
}>;

const { bemBlock, bemElement } = bemHelper("dividend-form");

type FormState = {
  asset: string;
  pieces: NumberInputValue;
  dividendPerShare: NumberInputValue;
  taxes: NumberInputValue;
  date: DateInputValue;
};

const DEFAULTS: FormState = {
  asset: "",
  pieces: undefined,
  dividendPerShare: undefined,
  taxes: 0,
  date: new Date(),
};

function DividendForm({ portfolioName }: DividendFormProps): ReactElement {
  const [formState, setFormState] = useState(DEFAULTS);
  const addDividendPayout = useAddDividendPayoutToPortfolio(portfolioName);

  const { asset, pieces, taxes, dividendPerShare, date } = formState;

  const payout: DividendPayout | undefined =
    !!asset &&
    pieces &&
    pieces > 0 &&
    dividendPerShare &&
    dividendPerShare > 0 &&
    (taxes || 0) >= 0 &&
    !!date &&
    new Date(date).getTime() < new Date().getTime()
      ? {
          uuid: uuid(),
          asset: asset,
          pieces: pieces,
          taxes: taxes || 0,
          dividendPerShare: dividendPerShare,
          timestamp: date.toISOString(),
        }
      : undefined;

  return (
    <div className={bemBlock(undefined)}>
      <AssetDropdown
        onChange={(isin) =>
          setFormState({ ...formState, asset: isin || DEFAULTS.asset })
        }
        className={bemElement("asset")}
      />
      <NumberInput
        label={"Pieces"}
        onChange={(pieces) => setFormState({ ...formState, pieces })}
        isMandatory
      />
      <NumberInput
        label={"Dividend per Share"}
        onChange={(dividend) =>
          setFormState({ ...formState, dividendPerShare: dividend })
        }
        isMandatory
      />
      <NumberInput
        label={"Total Taxes"}
        onChange={(taxes) => setFormState({ ...formState, taxes })}
      />
      <DateInput
        label={"Payout Date"}
        onChange={(date) => setFormState({ ...formState, date })}
        defaultDate={DEFAULTS.date}
      />
      <Button
        onClick={() => payout && addDividendPayout(payout)}
        label={"Submit"}
        isDisabled={!payout}
        isPrimary={true}
      />
    </div>
  );
}

export default DividendForm;
