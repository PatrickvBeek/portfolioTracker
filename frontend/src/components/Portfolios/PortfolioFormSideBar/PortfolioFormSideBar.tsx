import { Tab, Tabs } from "@mui/material";
import { ReactElement, useState } from "react";
import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { OrderInputForm } from "../OrderInputForm/OrderInputFrom";
import DividendForm from "./DividendForm/DividendForm";
import "./PortfolioFormSideBar.css";

const { bemBlock, bemElement } = bemHelper("portfolio-form-side-bar");

type PortfolioFormSideBarProps = Props<{ portfolioName: string }>;

const FORM = {
  ORDER: "order",
  DIVIDEND: "dividend",
} as const;
type Forms = (typeof FORM)[keyof typeof FORM];

function PortfolioFormSideBar({
  className,
  portfolioName,
}: PortfolioFormSideBarProps): ReactElement {
  const [tab, setTab] = useState<Forms>(FORM.ORDER);

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("headline")}>{"Add Data to Portfolio"}</div>
      <Tabs value={tab} onChange={(_, tab) => setTab(tab)} centered>
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
