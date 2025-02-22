import { FC, ReactElement } from "react";
import { ApiKeys } from "./apiKeys/ApiKeys";
import styles from "./Header.module.less";
import { Navigation } from "./navigation/Navigation";
import { DataExport } from "./userData/dataExport/DataExport";
import { DataImport } from "./userData/dataImport/DataImport";

export const Header: FC<{
  tabs: string[];
  selectedTab: string;
  onSelect: (s: string) => void;
}> = ({ tabs, selectedTab, onSelect }): ReactElement => (
  <div className={styles.container}>
    <div className={styles.content}>
      <Navigation tabs={tabs} selectedTab={selectedTab} onSelect={onSelect} />
      <div className={styles.controls}>
        <ApiKeys />
        <DataExport />
        <DataImport />
      </div>
    </div>
  </div>
);
