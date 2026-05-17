import React from "react";
import { Upload, Download, KeyRound } from "lucide-react";
import { Sheet } from "../../ui/Sheet";
import { Button } from "../../ui/Button";
import { Dialog } from "../../ui/Dialog";
import { cn } from "../../../utility/cn";
import ApiKeysOverlay from "../apiKeys/ApiKeysOverlay";
import { useApiKeysManager } from "../apiKeys/useApiKeysManager";
import { useDataExport } from "../userData/dataExport/useDataExport";
import { useDataImport } from "../userData/dataImport/useDataImport";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabs: string[];
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  open,
  onOpenChange,
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
    onOpenChange(false);
  };

  const handleExportClick = () => {
    exportData();
    onOpenChange(false);
  };

  const handleImportClick = () => {
    triggerFileImport();
    onOpenChange(false);
  };

  const handleApiKeysClick = () => {
    openApiKeys();
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} side="right">
        <div className="flex flex-col h-full">
          <nav className="mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "w-full text-left px-4 py-3 text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-border-focus",
                  tab === selectedTab
                    ? "text-accent bg-accent-soft font-semibold"
                    : "text-text-muted hover:text-text hover:bg-bg-elevated"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="border-t border-border my-2" />

          <div className="flex flex-col gap-1">
            <Button
              intent="ghost"
              onClick={handleImportClick}
              className="w-full justify-start gap-3 px-4 py-3"
            >
              <Upload size={20} />
              <span className="text-base">Import Data</span>
            </Button>

            <Button
              intent="ghost"
              onClick={handleExportClick}
              className="w-full justify-start gap-3 px-4 py-3"
            >
              <Download size={20} />
              <span className="text-base">Export Data</span>
            </Button>

            <Button
              intent="ghost"
              onClick={handleApiKeysClick}
              className="w-full justify-start gap-3 px-4 py-3"
            >
              <KeyRound size={20} />
              <span className="text-base">Manage API Keys</span>
            </Button>
          </div>
        </div>
      </Sheet>

      <ApiKeysOverlay
        open={isOverlayOpen}
        onClose={closeApiKeys}
        yahooKey={yahooKey}
        onYahooKeyChange={setYahooKey}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={isErrorDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsErrorDialogOpen(false);
          }
        }}
        title="Error parsing file"
      >
        <div className="text-text">
          Oh no! 😢 <br />
          An unknown error occurred while reading the selected file.
        </div>
        <div className="mt-6 flex justify-end">
          <Button intent="ghost" onClick={() => setIsErrorDialogOpen(false)}>
            Okay
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default MobileMenuDrawer;
