import { Library } from "lucide-react";
import { useGetAssets } from "../../hooks/assets/assetHooks";
import { cn } from "../../utility/cn";
import { AssetInputForm } from "./AssetInputForm/AssetInputForm";
import { AssetTable } from "./AssetTable/AssetTable";
import { styles } from "./Assets.styles";
import { headingVariants, styles as headingStyles } from "../ui/heading.styles";

export function Assets({ className }: { className?: string }) {
  const assetLibrary = useGetAssets();
  const assetCount = assetLibrary ? Object.keys(assetLibrary).length : 0;

  return (
    <div className={cn(styles.pageWrapper, className)}>
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div className={styles.iconBadge}>
              <Library className="w-6 h-6 text-accent" />
            </div>
            <h1 className={headingVariants({ level: "h1" })}>Asset Library</h1>
          </div>
          <p className={headingStyles.subtitle}>
            {assetCount === 0
              ? "Start building your portfolio by adding assets"
              : `Managing ${assetCount} asset${assetCount !== 1 ? "s" : ""} in your library`}
          </p>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.contentBody}>
            <div className={styles.formSection}>
              <h2 className={headingVariants({ level: "section" })}>
                Add New Asset
              </h2>
              <AssetInputForm />
            </div>

            <div>
              <h2 className={headingVariants({ level: "section" })}>
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
