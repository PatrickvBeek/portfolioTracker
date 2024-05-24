import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { getComponentTest } from "../../../testUtils/componentTestBuilder";
import AssetSelect from "./AssetSelect";

const TEST_ASSET_ISIN = "isin";
const TEST_ASSET_NAME = "some asset";

describe("the AssetInputFields component", () => {
  const callback = vi.fn();
  getComponentTest({
    element: <AssetSelect onSelect={callback} />,
    mockData: {
      assetLib: {
        isin: { displayName: TEST_ASSET_NAME, isin: TEST_ASSET_ISIN },
      },
    },
  });

  it("renders the asset dropdown", async () => {
    expect(await screen.findByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the callback when an option is selected", async () => {
    await userEvent.click(await screen.findByLabelText(/asset/i));
    await userEvent.click(await screen.findByText(TEST_ASSET_NAME));
    expect(callback).toHaveBeenCalledWith(TEST_ASSET_ISIN);
  });
});
