import { bemHelper } from "../../../utility/bemHelper";
import Tile from "../../general/Tile";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import "./EmptyPortfolios.css";

const { bemBlock, bemElement } = bemHelper("empty-portfolios");

const Message = ({ className }: { className?: string }) => (
  <div className={className}>
    {
      "It appears that you don't have any portfolios registered yet. Let's get\
      started by adding one!"
    }
  </div>
);

const EmptyPortfolios = () => {
  return (
    <Tile header={"No Portfolios Found..."}>
      <div className={bemBlock(undefined)}>
        <Message className={bemElement("message")} />
        <PortfolioInputForm />
      </div>
    </Tile>
  );
};

export default EmptyPortfolios;
