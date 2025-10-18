import { AppBar, Stack } from "@mui/material";
import React, { useState } from "react";
import { useBreakpoint } from "../../theme/breakpoints";
import { ApiKeys } from "./apiKeys/ApiKeys";
import styles from "./Header.module.less";
import { MobileMenuButton, MobileMenuDrawer } from "./mobileMenu";
import { Navigation } from "./navigation/Navigation";
import { DataExport } from "./userData/dataExport/DataExport";
import { DataImport } from "./userData/dataImport/DataImport";

interface HeaderProps {
  tabs: string[];
  selectedTab: string;
  onSelect: (selectedTab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ tabs, selectedTab, onSelect }) => {
  const { isMobile } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMobileMenuClose = () => {
    setDrawerOpen(false);
  };

  return (
    <AppBar position="sticky">
      <div className={styles.content}>
        {!isMobile ? (
          <>
            <Navigation
              tabs={tabs}
              selectedTab={selectedTab}
              onSelect={onSelect}
            />
            <Stack spacing={1} direction="row">
              <ApiKeys />
              <DataExport />
              <DataImport />
            </Stack>
          </>
        ) : (
          <>
            <div className={styles.mobileTitle}>Portfolio Tracker</div>
            <MobileMenuButton onClick={handleMobileMenuToggle} />
          </>
        )}
      </div>

      {isMobile && (
        <MobileMenuDrawer
          open={drawerOpen}
          onClose={handleMobileMenuClose}
          tabs={tabs}
          selectedTab={selectedTab}
          onTabSelect={onSelect}
        />
      )}
    </AppBar>
  );
};

export { Header };
