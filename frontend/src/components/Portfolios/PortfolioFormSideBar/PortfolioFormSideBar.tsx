import { Tab, Tabs } from "@mui/material";
import { ReactElement, useState } from "react";
import { Props } from "../../../utility/types";
import { Headline } from "../../general/headline/Headline";
import { OrderInputForm } from "../OrderInputForm/OrderInputFrom";
import DividendForm from "./DividendForm/DividendForm";

type PortfolioFormSideBarProps = Props<{ portfolioName: string }>;

const FORM = {
  ORDER: "order",
  DIVIDEND: "dividend",
} as const;
type Forms = (typeof FORM)[keyof typeof FORM];

function PortfolioFormSideBar({
  portfolioName,
}: PortfolioFormSideBarProps): ReactElement {
  const [tab, setTab] = useState<Forms>(FORM.ORDER);

  return (
    <div>
      <Headline text={"Add Data to Portfolio"}></Headline>
      <Tabs
        value={tab}
        onChange={(_, tab) => setTab(tab)}
        sx={{
          borderBottom: "solid 1px #aaa",
        }}
      >
        <Tab label={"Order"} value={FORM.ORDER} />
        <Tab label={"Dividend"} value={FORM.DIVIDEND} />
      </Tabs>

      {tab === FORM.ORDER ? (
        <OrderInputForm portfolioName={portfolioName} />
      ) : (
        <DividendForm portfolioName={portfolioName} />
      )}
    </div>
  );
}

export default PortfolioFormSideBar;
