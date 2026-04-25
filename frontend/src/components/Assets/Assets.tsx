import { Library } from "lucide-react";
import { useGetAssets } from "../../hooks/assets/assetHooks";
import { cn } from "../../utility/cn";
import { AssetInputForm } from "./AssetInputForm/AssetInputForm";
import { AssetTable } from "./AssetTable/AssetTable";

export function Assets({ className }: { className?: string }) {
  const assetLibrary = useGetAssets();
  const assetCount = assetLibrary ? Object.keys(assetLibrary).length : 0;

  return (
    <div className={cn("min-h-screen bg-bg", className)}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent-soft">
              <Library className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              Asset Library
            </h1>
          </div>
          <p className="text-text-muted ml-11">
            {assetCount === 0
              ? "Start building your portfolio by adding assets"
              : `Managing ${assetCount} asset${assetCount !== 1 ? "s" : ""} in your library`}
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border border-border",
            "bg-bg-card shadow-lg",
            "p-4 md:p-6"
          )}
        >
          <div className="space-y-6">
            <div
              className={cn(
                "p-4 md:p-5 rounded-lg border border-border",
                "bg-bg-elevated"
              )}
            >
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                Add New Asset
              </h2>
              <AssetInputForm />
            </div>

            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                Your Assets
              </h2>
              <AssetTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
