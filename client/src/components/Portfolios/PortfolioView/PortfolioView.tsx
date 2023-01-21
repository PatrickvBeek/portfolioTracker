import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import { InventoryList } from "../InventoryList/InventoryList";
import "./PortfolioView.css";

const { bemBlock, bemElement } = bemHelper("portfolio-view");

export type PortfolioViewProps = Props<{
  portfolio: string;
}>;

const PortfolioView = ({ portfolio, className }: PortfolioViewProps) => {
  return (
    <div className={bemBlock(className)}>
      <InventoryList
        className={bemElement("inventory")}
        portfolio={portfolio}
      />
    </div>
  );
};

export default PortfolioView;
