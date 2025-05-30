import { AppBar, Stack } from "@mui/material";
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
  <AppBar position="sticky">
    <div className={styles.content}>
      <Navigation tabs={tabs} selectedTab={selectedTab} onSelect={onSelect} />
      <Stack spacing={1} direction={"row"}>
        <ApiKeys />
        <DataExport />
        <DataImport />
      </Stack>
    </div>
  </AppBar>
);
