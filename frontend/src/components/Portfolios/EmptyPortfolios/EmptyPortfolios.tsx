import Tile from "../../general/Tile";
import PortfolioInputForm from "../PortfolioFormSideBar/PortfolioInputForm/PortfolioInputForm";
import { styles } from "./EmptyPortfolios.styles";

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
      <div className={styles.container}>
        <Message className={styles.message} />
        <PortfolioInputForm />
      </div>
    </Tile>
  );
};

export default EmptyPortfolios;
