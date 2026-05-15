import { ReactElement, useState } from "react";
import { Heading } from "../../ui/Heading";
import { Tabs } from "../../ui/Tabs";
import { OrderInputForm } from "../OrderInputForm/OrderInputForm";
import DividendForm from "./DividendForm/DividendForm";

type PortfolioFormSideBarProps = { portfolioName: string };

const FORM = {
  ORDER: "Order",
  DIVIDEND: "Dividend",
} as const;
type Forms = (typeof FORM)[keyof typeof FORM];

const FORM_VALUES: readonly string[] = Object.values(FORM);

function isForm(value: string): value is Forms {
  return FORM_VALUES.includes(value);
}

function PortfolioFormSideBar({
  portfolioName,
}: PortfolioFormSideBarProps): ReactElement {
  const [tab, setTab] = useState<Forms>(FORM.ORDER);

  return (
    <div className="flex flex-col gap-3">
      <Heading level="h1">Add Data</Heading>
      <Tabs
        entries={[FORM.ORDER, FORM.DIVIDEND]}
        value={tab}
        onValueChange={(newValue) => {
          if (isForm(newValue)) {
            setTab(newValue);
          }
        }}
      />
      {tab === FORM.ORDER ? (
        <OrderInputForm portfolioName={portfolioName} />
      ) : (
        <DividendForm portfolioName={portfolioName} />
      )}
    </div>
  );
}

export default PortfolioFormSideBar;
