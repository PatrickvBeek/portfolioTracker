import { Asset } from "../../dataClasses/general";
import { JsonWriter } from "../jsonWriter/jsonWriter";

class AssetLibrary {
  path: string;
  fileName: string;
  assets: Record<string, Asset> = {};
  writer: JsonWriter;

  constructor(path: string, fileName: string) {
    this.path = path;
    this.fileName = fileName;
    this.writer = new JsonWriter(this.path);
  }

  add(asset: Asset) {
    this.assets = {
      ...this.assets,
      [asset.isin]: asset,
    };
  }

  remove(asset: Asset) {
    this.assets = Object.keys(this.assets)
      .filter((isin) => isin !== asset.isin)
      .reduce(
        (assets, isin) => Object.assign(assets, { [isin]: this.assets[isin] }),
        {}
      );
  }

  clear() {
    this.assets = {};
    this.write();
  }

  async write() {
    await this.writer.write(this.assets, this.fileName);
  }

  async read() {
    this.assets = await this.writer.read(this.fileName);
  }
}

export default AssetLibrary;
