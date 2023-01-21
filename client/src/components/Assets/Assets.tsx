import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import AssetInputForm from "../AssetInputForm/AssetInputForm";
import AssetTable from "../AssetTable/AssetTable";
import Tile from "../general/Tile";
import "./Assets.css";

const { bemBlock, bemElement } = bemHelper("assets-page");

export type AssetsProps = Props<{}>;

function Assets({ className }: AssetsProps) {
  return (
    <div className={bemBlock(className)}>
      <Tile
        className={bemElement("library")}
        header={<span>Asset Library</span>}
        body={
          <div className={bemElement("library-body")}>
            <AssetInputForm />
            <AssetTable />
          </div>
        }
      />
    </div>
  );
}

export default Assets;
