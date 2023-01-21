import { bemHelper } from "../../../utility/bemHelper";
import { Props } from "../../../utility/types";
import "./PortfolioViewSideBar.css";

const { bemBlock, bemElement } = bemHelper("portfolio-view-side-bar");

interface SideBarEntry {
  label: string;
  action: () => void;
}

export type PortfolioViewSideBarProps = Props<{
  heading: string;
  entries: SideBarEntry[];
}>;

const PortfolioViewSideBar = ({
  className,
  heading,
  entries,
}: PortfolioViewSideBarProps) => {
  return (
    <div className={bemBlock(className)}>
      <div role={"columnheader"} className={bemElement("heading")}>
        {heading}
      </div>
      {entries.map((entry) => (
        <div
          key={entry.label}
          role={"menuitem"}
          className={bemElement("entry")}
          onClick={entry.action}
        >
          {entry.label}
        </div>
      ))}
    </div>
  );
};

export default PortfolioViewSideBar;
