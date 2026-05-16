import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Tabs } from "../ui/Tabs";
import { Tooltip } from "../ui/Tooltip";
import { ApiKeys } from "./apiKeys/ApiKeys";
import { styles } from "./Header.styles";
import MobileMenuDrawer from "./mobileMenu/MobileMenuDrawer";
import { DataExport } from "./userData/dataExport/DataExport";
import { DataImport } from "./userData/dataImport/DataImport";

interface HeaderProps {
  tabs: string[];
  selectedTab: string;
  onSelect: (selectedTab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ tabs, selectedTab, onSelect }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <header className={styles.header()}>
      <div className={styles.content}>
        <div className={styles.logo}>Portfolio Tracker</div>

        <nav className={styles.desktopNav}>
          <Tabs entries={tabs} value={selectedTab} onValueChange={onSelect} />
        </nav>

        <div className={styles.actionStack}>
          <ApiKeys />
          <DataExport />
          <DataImport />
        </div>

        <Tooltip content="Menu" side="bottom">
          <button
            onClick={handleMobileMenuToggle}
            aria-label="Open navigation menu"
            className={styles.mobileMenuButton}
          >
            <Menu size={24} />
          </button>
        </Tooltip>
      </div>

      <MobileMenuDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tabs={tabs}
        selectedTab={selectedTab}
        onTabSelect={onSelect}
      />
    </header>
  );
};

export { Header };
