import { screen } from "@testing-library/react";
import { getElementsByIsin } from "pt-domain/src/dataHelpers";
import { vi } from "vitest";
import { customRender } from "../../../testUtils/componentHelpers";
import AssetSelect from "./AssetSelect";

const TEST_ASSET_ISIN = "isin";
const TEST_ASSET_NAME = "some asset";

describe("the AssetInputFields component", () => {
  const callback = vi.fn();

  localStorage.setItem(
    "assets",
    JSON.stringify(
      getElementsByIsin([
        { displayName: TEST_ASSET_NAME, isin: TEST_ASSET_ISIN },
      ])
    )
  );

  it("renders the asset dropdown", async () => {
    customRender({
      component: <AssetSelect onChange={callback} />,
    });
    expect(await screen.findByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the callback when an option is selected", async () => {
    const { selectAsset } = customRender({
      component: <AssetSelect onChange={callback} />,
    });
    await selectAsset(TEST_ASSET_NAME);
    expect(callback).toHaveBeenCalledWith(TEST_ASSET_ISIN);
  });
});
