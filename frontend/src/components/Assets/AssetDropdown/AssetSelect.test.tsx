import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { getComponentTest } from "../../../testUtils/componentTestRunner";
import AssetSelect from "./AssetSelect";

const TEST_ASSET_ISIN = "isin";
const TEST_ASSET_NAME = "some asset";

describe("the AssetInputFields component", () => {
  const callback = vi.fn();
  const test = getComponentTest({
    element: <AssetSelect onSelect={callback} />,
    mockData: {
      assetLib: {
        isin: { displayName: TEST_ASSET_NAME, isin: TEST_ASSET_ISIN },
      },
    },
  });

  beforeAll(() => test.server.listen());
  beforeEach(() => test.render());
  afterAll(() => test.server.close());

  it("renders the asset dropdown", async () => {
    expect(await screen.findByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the callback when an option is selected", () => {
    userEvent.click(screen.getByLabelText(/asset/i));
    userEvent.click(screen.getByText(TEST_ASSET_NAME));
    expect(callback).toHaveBeenCalledWith(TEST_ASSET_ISIN);
  });
});
