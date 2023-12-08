import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import { InvestmentHistoryChart } from "../charts/investmentHistory/InvestmentHistoryChart";
import SelectionHeader from "../general/SelectionHeader";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import { ClosedInventoryList } from "./InventoryList/ClosedInventoryList/ClosedInventoryList";
import { OpenInventoryList } from "./InventoryList/OpenInventoryList/OpenInventoryList";
import PortfolioActionsBar from "./PortfolioActionsBar/PortfolioActionsBar";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import "./Portfolios.css";

const { bemBlock, bemElement } = bemHelper("portfolios");

export type PortfolioProps = Props<{}>;

function Portfolios({ className }: PortfolioProps) {
  const portfoliosQuery = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  useEffect(() => {
    const portfolios = Object.keys(portfoliosQuery.data || {});
    if (!portfolios.includes(selectedPortfolio)) {
      setSelectedPortfolio(portfolios[0] || "");
    }
  }, [portfoliosQuery.data, selectedPortfolio]);

  if (portfoliosQuery.isLoading || !selectedPortfolio) {
    return <div>portfolios are loading...</div>;
  }

  if (portfoliosQuery.isError) {
    return <div>an error occurred while loading your portfolios...</div>;
  }

  if (portfoliosQuery.isIdle) {
    return <div>query is idling</div>;
  }

  const portfolios = portfoliosQuery.data;

  if (Object.keys(portfolios).length < 1) {
    return <EmptyPortfolios />;
  }

  return (
    <div className={bemBlock(className)}>
      <PortfolioActionsBar
        className={bemElement("side-bar")}
        portfolioName={selectedPortfolio}
      />
      <div className={bemElement("header")}>
        <SelectionHeader
          entries={Object.keys(portfolios)}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
          className={bemElement("portfolio-selection")}
        />
      </div>
      <div className={bemElement("content")}>
        <InvestmentHistoryChart portfolioName={selectedPortfolio} />
        <OpenInventoryList portfolioName={selectedPortfolio} />
        <ClosedInventoryList portfolioName={selectedPortfolio} />
        <ActivityList portfolio={selectedPortfolio} />
      </div>
      <PortfolioFormSideBar
        className={bemElement("order-side-bar")}
        portfolioName={selectedPortfolio}
      />
    </div>
  );
}

export default Portfolios;
