import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { getComponentTest } from "../../../testUtils/componentTestBuilder";
import { mockNetwork } from "../../../testUtils/networkMock";
import AssetSelect from "./AssetSelect";

const TEST_ASSET_ISIN = "isin";
const TEST_ASSET_NAME = "some asset";

describe("the AssetInputFields component", () => {
  const callback = vi.fn();
  const { selectAsset } = getComponentTest({
    element: <AssetSelect onSelect={callback} />,
  });

  mockNetwork({
    assetLib: {
      isin: { displayName: TEST_ASSET_NAME, isin: TEST_ASSET_ISIN },
    },
  });

  it("renders the asset dropdown", async () => {
    expect(await screen.findByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the callback when an option is selected", async () => {
    await selectAsset(TEST_ASSET_NAME);
    expect(callback).toHaveBeenCalledWith(TEST_ASSET_ISIN);
  });
});
