import { DividendPayout } from "pt-domain";
import { ReactElement, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAddDividendPayoutToPortfolio } from "../../../../userDataContext";
import AssetDropdown from "../../../Assets/AssetDropdown/AssetSelect";
import { Button } from "../../../ui/Button";
import { DateInput, type DateInputValue } from "../../../ui/DateInput";
import { NumberInput, type NumberInputValue } from "../../../ui/NumberInput";
import { styles } from "./DividendForm.styles";

type DividendFormProps = {
  portfolioName: string;
};

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

const toPayout = (formState: FormState): DividendPayout | undefined => {
  const { asset, pieces, dividendPerShare, taxes, date } = formState;

  if (!asset || !pieces || pieces <= 0) {
    return undefined;
  }
  if (!dividendPerShare || dividendPerShare <= 0) {
    return undefined;
  }
  if ((taxes || 0) < 0) {
    return undefined;
  }
  if (!date || new Date(date).getTime() >= new Date().getTime()) {
    return undefined;
  }

  return {
    uuid: uuid(),
    asset,
    pieces,
    taxes: taxes || 0,
    dividendPerShare,
    timestamp: date.toISOString(),
  };
};

function DividendForm({ portfolioName }: DividendFormProps): ReactElement {
  const [formState, setFormState] = useState(DEFAULTS);
  const addDividendPayout = useAddDividendPayoutToPortfolio(portfolioName);

  const payout = toPayout(formState);

  return (
    <div className={styles.container}>
      <AssetDropdown
        onChange={(isin) =>
          setFormState({ ...formState, asset: isin || DEFAULTS.asset })
        }
        label="Asset"
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
        disabled={!payout}
      >
        Submit
      </Button>
    </div>
  );
}

export default DividendForm;
