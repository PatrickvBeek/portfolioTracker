import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import AssetSelect from "./AssetSelect";

const mockUseGetAssets = useGetAssets as jest.Mock<any>;
jest.mock("../../../hooks/assets/assetHooks");

const TEST_ASSET_ISIN = "isin";
const TEST_ASSET_NAME = "some asset";
describe("the AssetInputFields component", () => {
  beforeEach(() => {
    mockUseGetAssets.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { isin: { displayName: TEST_ASSET_NAME, isin: TEST_ASSET_ISIN } },
    });
  });
  it("renders the asset dropdown", () => {
    render(<AssetSelect onSelect={jest.fn()} />);
    expect(screen.getByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the getUseAssets hook", () => {
    render(<AssetSelect onSelect={jest.fn()} />);
    expect(mockUseGetAssets).toHaveBeenCalled();
  });

  it("calls the callback when an option is selected", () => {
    const callback = jest.fn();
    render(<AssetSelect onSelect={callback} />);
    userEvent.click(screen.getByLabelText(/asset/i));
    userEvent.click(screen.getByText(TEST_ASSET_NAME));
    expect(callback).toHaveBeenCalledWith(TEST_ASSET_ISIN);
  });
});
