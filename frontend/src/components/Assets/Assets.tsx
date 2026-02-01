import { bemHelper } from "../../utility/bemHelper";
import { Props } from "../../utility/types";
import Tile from "../general/Tile";
import AssetInputForm from "./AssetInputForm/AssetInputForm";
import AssetTable from "./AssetTable/AssetTable";
import "./Assets.css";

const { bemBlock, bemElement } = bemHelper("assets-page");

export type AssetsProps = Props<object>;

function Assets({ className }: AssetsProps) {
  return (
    <div className={bemBlock(className)}>
      <Tile className={bemElement("library")} header={"Asset Library"}>
        <div className={bemElement("library-body")}>
          <AssetInputForm />
          <AssetTable />
        </div>
      </Tile>
    </div>
  );
}

export default Assets;
