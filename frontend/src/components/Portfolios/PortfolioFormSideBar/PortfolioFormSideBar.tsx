import { ReactElement, useState } from "react";
import { Heading } from "../../ui/Heading";
import { Tabs } from "../../ui/Tabs";
import { OrderInputForm } from "../OrderInputForm/OrderInputForm";
import DividendForm from "./DividendForm/DividendForm";
import { styles } from "./PortfolioFormSideBar.styles";

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
    <div className={styles.container}>
      <div className={styles.sectionBody}>
        <Heading level="section">Add Data</Heading>
        <Tabs
          entries={[
            {
              value: FORM.ORDER,
              content: <OrderInputForm portfolioName={portfolioName} />,
            },
            {
              value: FORM.DIVIDEND,
              content: <DividendForm portfolioName={portfolioName} />,
            },
          ]}
          value={tab}
          contentClassName={styles.tabContent}
          onValueChange={(newValue) => {
            if (isForm(newValue)) {
              setTab(newValue);
            }
          }}
        />
      </div>
    </div>
  );
}

export default PortfolioFormSideBar;
