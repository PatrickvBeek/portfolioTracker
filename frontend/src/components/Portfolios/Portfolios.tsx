import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import { PortfolioHistoryChart } from "../charts/portfolioHistory/PortfolioHistoryChart";
import { TimeWeightedReturnHistory } from "../charts/timeWeightedReturnHistory/TimeWeightedReturnHistory";
import SelectionHeader from "../general/SelectionHeader";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioActionsBar from "./PortfolioActionsBar/PortfolioActionsBar";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import "./Portfolios.css";
import { ClosedPositionsList } from "./PositionList/ClosedPositionsList/ClosedPositionsList";
import { OpenPositionsList } from "./PositionList/OpenPositionsList/OpenPositionsList";
import { PortfolioSummary } from "./portfolioSummary/PortfolioSummary";

const { bemBlock, bemElement } = bemHelper("portfolios");

export type PortfolioProps = Props<{}>;

function Portfolios({ className }: PortfolioProps) {
  const portfolioLib = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(Object.keys(portfolioLib)[0]);

  useEffect(() => {
    const portfolios = Object.keys(portfolioLib || {});
    if (!selectedPortfolio || !portfolios.includes(selectedPortfolio)) {
      setSelectedPortfolio(portfolios[0]);
    }
  }, [portfolioLib, selectedPortfolio]);

  if (Object.keys(portfolioLib).length < 1) {
    return <EmptyPortfolios />;
  }

  if (!selectedPortfolio) {
    return <></>;
  }

  return (
    <div className={bemBlock(className)}>
      <PortfolioActionsBar
        className={bemElement("side-bar")}
        portfolioName={selectedPortfolio}
      />
      <div className={bemElement("header")}>
        <SelectionHeader
          entries={Object.keys(portfolioLib)}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
          className={bemElement("portfolio-selection")}
        />
      </div>
      <div className={bemElement("content")}>
        <PortfolioSummary portfolioName={selectedPortfolio} />
        <PortfolioHistoryChart portfolioName={selectedPortfolio} />
        <TimeWeightedReturnHistory portfolioName={selectedPortfolio} />
        <OpenPositionsList portfolioName={selectedPortfolio} />
        <ClosedPositionsList portfolioName={selectedPortfolio} />
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
