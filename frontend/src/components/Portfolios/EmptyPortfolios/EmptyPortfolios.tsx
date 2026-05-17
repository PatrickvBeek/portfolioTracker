import { Heading } from "../../ui/Heading";
import { pageLayout } from "../../ui/page-layout.styles";
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
    <div className={pageLayout.sectionCard}>
      <div className={pageLayout.sectionBody}>
        <Heading level="section">No Portfolios Found...</Heading>
        <div className={styles.container}>
          <Message className={styles.message} />
          <PortfolioInputForm />
        </div>
      </div>
    </div>
  );
};

export default EmptyPortfolios;
