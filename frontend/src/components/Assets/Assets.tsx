import { Library } from "lucide-react";
import { useGetAssets } from "../../hooks/assets/assetHooks";
import { AssetInputForm } from "./AssetInputForm/AssetInputForm";
import { AssetTable } from "./AssetTable/AssetTable";
import { styles } from "./Assets.styles";
import { Heading } from "../ui/Heading";
import { styles as headingStyles } from "../ui/heading.styles";

export function Assets() {
  const assetLibrary = useGetAssets();
  const assetCount = assetLibrary ? Object.keys(assetLibrary).length : 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div className={styles.iconBadge}>
              <Library className="w-6 h-6 text-accent" />
            </div>
            <Heading level="h1">Asset Library</Heading>
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
              <Heading level="section">Add New Asset</Heading>
              <AssetInputForm />
            </div>

            <div>
              <Heading level="section">Your Assets</Heading>
              <AssetTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
