import { useEffect, useState } from "react";
import {
  useAddCashTransactionToPortfolioWithName,
  useDeletePortfolio,
  useGetPortfolios,
} from "../../hooks/portfolios/portfolioHooks";
import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import Confirmation from "../general/Confirmation/Confirmation";
import Overlay from "../general/Overlay/Overlay";
import SelectionHeader from "../general/SelectionHeader";
import EmptyPortfolios from "./EmptyPortfolios/EmptyPortfolios";
import { OpenInventoryList } from "./InventoryList/OpenInventoryList/OpenInventoryList";
import { OrderInputForm } from "./OrderInputForm/OrderInputFrom";
import PortfolioInputForm from "./PortfolioInputForm/PortfolioInputForm";
import "./Portfolios.css";
import PortfolioViewSideBar from "./PortfolioViewSideBar/PortfolioViewSideBar";
import TransactionInputForm from "./TransactionInputForm/TransactionInputForm";

const { bemBlock, bemElement } = bemHelper("portfolios");

export type PortfolioProps = Props<{}>;

function Portfolios({ className }: PortfolioProps) {
  const portfoliosQuery = useGetPortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [isAddPortfolioOverlayOpen, setIsAddOverlayOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const deletePortfolio = useDeletePortfolio().mutate;
  const addTransaction =
    useAddCashTransactionToPortfolioWithName(selectedPortfolio).mutate;

  useEffect(() => {
    const portfolios = Object.keys(portfoliosQuery.data || {});
    if (!portfolios.includes(selectedPortfolio)) {
      setSelectedPortfolio(portfolios[0] || "");
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

  return (
    <div className={bemBlock(className)}>
      <div className={bemElement("side-bar")}>
        <PortfolioViewSideBar
          className={bemElement("side-bar-group")}
          heading="Actions"
          entries={[
            { label: "Add Portfolio", action: () => setIsAddOverlayOpen(true) },
            {
              label: "Delete Portfolio",
              action: () => setIsDeleteConfirmationOpen(true),
            },
          ]}
        />
      </div>
      <div className={bemElement("header")}>
        <SelectionHeader
          entries={Object.keys(portfolios)}
          selectedEntry={selectedPortfolio}
          setSelectedEntry={setSelectedPortfolio}
          className={bemElement("portfolio-selection")}
        />
      </div>
      <div className={bemElement("content")}>
        <OpenInventoryList portfolioName={selectedPortfolio} />
      </div>
      <div className={bemElement("order-side-bar")}>
        <div>
          <div className={bemElement("form-headline")}>Add Order</div>
          <OrderInputForm
            portfolioName={selectedPortfolio}
            className={bemElement("order-from")}
            shape={"column"}
          />
        </div>
        <div>
          <div className={bemElement("form-headline")}>Add Transaction</div>
          <TransactionInputForm onSubmit={addTransaction} />
        </div>
      </div>
      {isAddPortfolioOverlayOpen && (
        <Overlay
          title={"Add a new Portfolio"}
          onClose={() => setIsAddOverlayOpen(false)}
        >
          <PortfolioInputForm />
        </Overlay>
      )}
      {isDeleteConfirmationOpen && (
        <Confirmation
          title={`Delete ${selectedPortfolio}?`}
          body={`You are about to delete the portfolio '${selectedPortfolio}'. This will delete also all associated transaction data. Do you want to continue?`}
          confirmLabel={"Delete"}
          cancelLabel={"Cancel"}
          onConfirm={() => {
            deletePortfolio(portfolios[selectedPortfolio]);
            setIsDeleteConfirmationOpen(false);
          }}
          onCancel={() => setIsDeleteConfirmationOpen(false)}
        />
      )}
    </div>
  );
}

export default Portfolios;
