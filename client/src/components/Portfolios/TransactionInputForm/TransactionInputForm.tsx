import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { CashTransaction } from "../../../data/types";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { Button } from "../../general/Button";
import { DateInput, DateInputValue } from "../../general/DateInput";
import Dropdown from "../../general/Dropdown/Dropdown";
import {
  NumberInput,
  NumberInputValue,
} from "../../general/NumberInput/NumberInput";
import "./TransactionInputForm.css";

const { bemElement, bemBlock } = bemHelper("transaction-input-form");

export type TransactionInputFormProps = Props<{
  onSubmit: (transaction: CashTransaction) => void;
}>;

function TransactionInputForm({
  className,
  onSubmit,
}: TransactionInputFormProps) {
  const [transactionType, setTransactionType] = useState("deposit");
  const [amount, setAmount] = useState(0 as NumberInputValue);
  const [date, setDate] = useState<DateInputValue>(new Date());

  const isFormValid = transactionType && amount && date;

  const transaction = isFormValid
    ? {
        type: transactionType,
        amount: amount,
        date: date.toISOString(),
        uuid: uuidV4(),
      }
    : undefined;

  return (
    <div className={bemBlock(className)} data-testid="transaction-input-form">
      <Dropdown
        onSelect={(value) => setTransactionType(value)}
        options={[
          { id: "deposit", optionName: "Deposit" },
          { id: "withdraw", optionName: "Withdraw" },
        ]}
        selected={transactionType}
        label="Transaction Type"
        className={bemElement("type")}
        isMandatory={true}
      />
      <NumberInput
        digits={2}
        onChange={setAmount}
        label={"Amount"}
        className={bemElement("amount")}
        isMandatory={true}
        autoComplete={"off"}
      />
      <DateInput
        className={bemElement("date")}
        onChange={setDate}
        defaultDate={new Date()}
        label={"Transaction Date"}
        isMandatory={true}
      />
      <Button
        className={bemElement("button")}
        onClick={() => transaction && onSubmit(transaction)}
        label={"Submit"}
        isDisabled={!isFormValid}
        isPrimary={true}
      />
    </div>
  );
}

export default TransactionInputForm;
