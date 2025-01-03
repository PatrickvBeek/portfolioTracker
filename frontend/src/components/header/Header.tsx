import { FC, ReactElement } from "react";
import { DataExport } from "./dataExport/DataExport";
import styles from "./Header.module.less";
import { Navigation } from "./navigation/Navigation";

export const Header: FC<{
  tabs: string[];
  selectedTab: string;
  onSelect: (s: string) => void;
}> = ({ tabs, selectedTab, onSelect }): ReactElement => (
  <div className={styles.container}>
    <div className={styles.content}>
      <Navigation tabs={tabs} selectedTab={selectedTab} onSelect={onSelect} />
      <DataExport />
    </div>
  </div>
);
