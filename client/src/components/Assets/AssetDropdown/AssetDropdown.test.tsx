import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import AssetDropdown from "./AssetDropdown";

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
    render(<AssetDropdown onSelect={jest.fn()} />);
    expect(screen.getByLabelText(/asset/i)).toBeInTheDocument();
  });

  it("calls the getUseAssets hook", () => {
    render(<AssetDropdown onSelect={jest.fn()} />);
    expect(mockUseGetAssets).toHaveBeenCalled();
  });

  it("calls the callback when an option is selected", () => {
    const callback = jest.fn();
    render(<AssetDropdown onSelect={callback} />);
    userEvent.selectOptions(screen.getByLabelText(/asset/i), TEST_ASSET_ISIN);
    expect(callback).toHaveBeenCalledWith("isin");
  });
});
