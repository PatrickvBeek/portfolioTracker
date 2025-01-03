import classNames from "classnames";
import { FC } from "react";
import styles from "./Navigation.module.less";

export const Navigation: FC<{
  tabs: string[];
  selectedTab: string;
  onSelect: (s: string) => void;
}> = ({ tabs, selectedTab, onSelect }) => {
  return (
    <div role={"navigation"}>
      <div className={styles.tabs} role={"tablist"}>
        {tabs.map((tab) => (
          <div
            role={"tab"}
            className={classNames(styles.tab, {
              [styles.tab_selected]: tab === selectedTab,
            })}
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
