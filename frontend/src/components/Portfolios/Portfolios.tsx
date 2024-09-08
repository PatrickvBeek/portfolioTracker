import { useEffect, useState } from "react";
import { useGetPortfolios } from "../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import { InitialValueHistoryChart } from "../charts/investmentHistory/InitialValueHistoryChart";
import SelectionHeader from "../general/SelectionHeader";
import ActivityList from "./ActivityList/ActivityList";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import PortfolioActionsBar from "./PortfolioActionsBar/PortfolioActionsBar";
import PortfolioFormSideBar from "./PortfolioFormSideBar/PortfolioFormSideBar";
import "./Portfolios.css";
import { ClosedPositionsList } from "./PositionList/ClosedPositionsList/ClosedPositionsList";
import { OpenPositionsList } from "./PositionList/OpenPositionsList/OpenPositionsList";

const { bemBlock, bemElement } = bemHelper("portfolios");

export type PortfolioProps = Props<{}>;

function Portfolios({ className }: PortfolioProps) {
  const portfoliosQuery = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const portfolios = Object.keys(portfoliosQuery.data || {});
    if (!selectedPortfolio || !portfolios.includes(selectedPortfolio)) {
      setSelectedPortfolio(portfolios[0]);
    }
  }, [portfoliosQuery.data, selectedPortfolio]);

  if (portfoliosQuery.isLoading) {
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
          entries={Object.keys(portfolios)}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
          className={bemElement("portfolio-selection")}
        />
      </div>
      <div className={bemElement("content")}>
        <InitialValueHistoryChart portfolioName={selectedPortfolio} />
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
