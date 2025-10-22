import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";
import { InfoDialog } from "../../general/InfoDialog/InfoDialog";
import ApiKeysOverlay from "../apiKeys/ApiKeysOverlay";
import { useApiKeysManager } from "../apiKeys/useApiKeysManager";
import { useDataExport } from "../userData/dataExport/useDataExport";
import { useDataImport } from "../userData/dataImport/useDataImport";
import styles from "./MobileMenuDrawer.module.less";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  tabs: string[];
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  open,
  onClose,
  tabs,
  selectedTab,
  onTabSelect,
}) => {
  const { exportData } = useDataExport();
  const { triggerFileImport, isErrorDialogOpen, setIsErrorDialogOpen } =
    useDataImport();
  const {
    isOverlayOpen,
    yahooKey,
    setYahooKey,
    openApiKeys,
    closeApiKeys,
    handleSubmit,
  } = useApiKeysManager();

  const handleTabClick = (tab: string) => {
    onTabSelect(tab);
    onClose();
  };

  const handleExportClick = () => {
    exportData();
    onClose();
  };

  const handleImportClick = () => {
    triggerFileImport();
    onClose();
  };

  const handleApiKeysClick = () => {
    openApiKeys();
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        classes={{
          paper: styles.drawerPaper,
        }}
      >
        <Box className={styles.drawerContent} role="presentation">
          {/* Navigation Section */}
          <List className={styles.navigationSection}>
            {tabs.map((tab) => (
              <ListItem key={tab} disablePadding>
                <ListItemButton
                  selected={tab === selectedTab}
                  onClick={() => handleTabClick(tab)}
                  className={`${styles.menuItem} ${tab === selectedTab ? styles.selectedTab : ""}`}
                >
                  <ListItemText
                    primary={tab}
                    classes={{ primary: styles.tabText }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Action Section */}
          <List className={styles.actionSection}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleImportClick}
                className={styles.menuItem}
              >
                <i
                  className="fa-solid fa-file-arrow-up"
                  style={{ color: "var(--theme)" }}
                />
                <ListItemText
                  primary="Import Data"
                  classes={{ primary: styles.actionText }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleExportClick}
                className={styles.menuItem}
              >
                <i
                  className="fa-solid fa-file-arrow-down"
                  style={{ color: "var(--theme)" }}
                />
                <ListItemText
                  primary="Export Data"
                  classes={{ primary: styles.actionText }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleApiKeysClick}
                className={styles.menuItem}
              >
                <i
                  className="fa-solid fa-key"
                  style={{ color: "var(--theme)" }}
                />
                <ListItemText
                  primary="Manage API Keys"
                  classes={{ primary: styles.actionText }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <ApiKeysOverlay
        open={isOverlayOpen}
        onClose={closeApiKeys}
        yahooKey={yahooKey}
        onYahooKeyChange={setYahooKey}
        onSubmit={handleSubmit}
      />

      <InfoDialog
        open={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        title="Error parsing file"
        message={
          <div>
            Oh no! 😢 <br />
            An unknown error occurred while reading the selected file.
          </div>
        }
        actionLabel="Okay"
      />
    </>
  );
};

export default MobileMenuDrawer;
