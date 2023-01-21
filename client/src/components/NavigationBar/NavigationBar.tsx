import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import "./NavigationBar.css";

const { bemBlock, bemElement } = bemHelper("navigation-bar");

export type NavigationBarProps = Props<{
  tabs: string[];
  selectedTab: string;
  onSelect: (s: string) => void;
}>;

const NavigationBar = ({
  tabs,
  selectedTab,
  onSelect,
  className,
}: NavigationBarProps) => {
  return (
    <div className={bemBlock(className)} role={"navigation"}>
      <div className={bemElement("tab-list")} role={"tablist"}>
        {tabs.map((tab) => (
          <div
            role={"tab"}
            className={bemElement("tab", { selected: tab === selectedTab })}
            key={tab}
            onClick={() => onSelect(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
