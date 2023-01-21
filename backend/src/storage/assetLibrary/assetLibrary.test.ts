import { Asset } from "../../dataClasses/general";
import AssetLibrary from "./assetLibrary";
import fs from "fs";

const TEST_ASSET: Asset = {
  displayName: "test-asset-display-name",
  isin: "test-isisn",
  wkn: "test-wkn",
};
const TEST_ASSET_2: Asset = {
  displayName: "test-asset-display-name-2",
  isin: "test-isisn-2",
  wkn: "test-wkn-2",
};

const PATH = "./test_data/assetLibrary_test";
const FILE_NAME = "AssetLibrary";

describe("the asset library", () => {
  let assetLibrary: AssetLibrary;

  beforeEach(() => {
    fs.rmSync(`${PATH}/${FILE_NAME}`, { force: true });
    assetLibrary = new AssetLibrary(PATH, FILE_NAME);
  });

  it("can be instantiated", () => {
    expect(assetLibrary).toBeDefined();
  });

  it("accepts adding assets", () => {
    assetLibrary.add(TEST_ASSET);
    expect(assetLibrary.assets[TEST_ASSET.isin]).toEqual(TEST_ASSET);
  });

  it("can delete an added asset", () => {
    assetLibrary.add(TEST_ASSET);
    expect(assetLibrary.assets[TEST_ASSET.isin]).toEqual(TEST_ASSET);
    assetLibrary.remove(TEST_ASSET);
    expect(assetLibrary.assets[TEST_ASSET.isin]).not.toBeDefined();
  });

  it("hold only 1 asset after adding it twice", () => {
    assetLibrary.add(TEST_ASSET);
    assetLibrary.add(TEST_ASSET);
    expect(Object.keys(assetLibrary.assets).length).toBe(1);
  });

  it("holds 2 assets after adding 2 different assets", () => {
    assetLibrary.add(TEST_ASSET);
    assetLibrary.add(TEST_ASSET_2);
    expect(Object.keys(assetLibrary.assets).length).toBe(2);
  });

  it("can write the assets map to disk", async () => {
    assetLibrary.add(TEST_ASSET);
    assetLibrary.add(TEST_ASSET_2);
    await assetLibrary.write();
    expect(fs.existsSync(`${PATH}/${FILE_NAME}.json`)).toBe(true);
  });

  it("can parse the asset map from disk", async () => {
    assetLibrary.add(TEST_ASSET);
    assetLibrary.add(TEST_ASSET_2);
    await assetLibrary.write();
    expect(fs.existsSync(`${PATH}/${FILE_NAME}.json`)).toBe(true);
    assetLibrary.remove(TEST_ASSET);
    assetLibrary.remove(TEST_ASSET_2);
    expect(Object.keys(assetLibrary.assets).length).toBe(0);
    await assetLibrary.read();
    expect(Object.keys(assetLibrary.assets).length).toBe(2);
    expect(assetLibrary.assets[TEST_ASSET.isin]).toEqual(TEST_ASSET);
    expect(assetLibrary.assets[TEST_ASSET_2.isin]).toEqual(TEST_ASSET_2);
  });
});
