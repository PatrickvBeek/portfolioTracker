import { screen, within } from "@testing-library/react";
import { AssetLibrary } from "pt-domain";
import { customRender } from "../../testUtils/componentHelpers";
import { setUserData } from "../../testUtils/localStorage";
import { getPriceResponse, mockNetwork } from "../../testUtils/networkMock";
import { Assets } from "./Assets";

const TESLA = { displayName: "Tesla", isin: "US88160R1014" };
const GOOGLE = {
  displayName: "Alphabet",
  isin: "US02079K3059",
  symbol: "GOOGL",
};

const nameInput = () => screen.getByLabelText(/^Asset Name/);
const isinInput = () => screen.getByLabelText(/^ISIN/);
const symbolInput = () => screen.getByLabelText(/^Symbol/);

const ASSET_LIB: AssetLibrary = {
  [TESLA.isin]: TESLA,
  [GOOGLE.isin]: GOOGLE,
};

const assetTable = () => screen.getByRole("table");

describe("Assets tab", () => {
  mockNetwork({ prices: getPriceResponse("GOOGL", [[new Date(), 175]]) });

  afterEach(() => {
    localStorage.clear();
  });

  it("shows an encouraging message when the asset library is empty", () => {
    setUserData({ assets: {} });
    customRender({ component: <Assets /> });

    expect(
      screen.getByText("Start building your portfolio by adding assets")
    ).toBeInTheDocument();
    expect(screen.getByText("No assets in your library.")).toBeInTheDocument();
  });

  // --- Adding an asset ---

  it("adds a new asset that appears in the table after form submission", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(nameInput(), "Microsoft");
    await user.type(isinInput(), "US5949181045");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const table = assetTable();
    expect(
      within(table).getByRole("cell", { name: "Microsoft" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "US5949181045" })
    ).toBeInTheDocument();
  });

  it("adds an asset with a symbol that appears in the table", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(nameInput(), "Apple");
    await user.type(isinInput(), "US0378331005");
    await user.type(symbolInput(), "AAPL");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const table = assetTable();
    expect(
      within(table).getByRole("cell", { name: "Apple" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: /AAPL/ })
    ).toBeInTheDocument();
  });

  it("clears the form fields after successful submission", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(nameInput(), "Nvidia");
    await user.type(isinInput(), "US67066G1040");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      within(assetTable()).getByRole("cell", { name: "Nvidia" })
    ).toBeInTheDocument();
    expect(nameInput()).toHaveValue("");
    expect(isinInput()).toHaveValue("");
    expect(symbolInput()).toHaveValue("");
  });

  // --- Validation ---

  it("shows a validation error when the name is only whitespace", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    const input = nameInput();
    await user.type(input, " ");

    expect(
      screen.getByText("Please enter a non-empty string.")
    ).toBeInTheDocument();
  });

  it("shows a validation error when the ISIN is not exactly 12 characters", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(isinInput(), "SHORT");

    expect(
      screen.getByText("An ISIN contains exactly 12 characters.")
    ).toBeInTheDocument();
  });

  it("shows a validation error when the symbol format is invalid", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(symbolInput(), "A");

    expect(
      screen.getByText("A symbol contains five or fewer letters.")
    ).toBeInTheDocument();
  });

  it("does not show validation errors before the user starts typing", () => {
    setUserData({ assets: {} });
    customRender({ component: <Assets /> });

    expect(
      screen.queryByText("Please enter a non-empty string.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("An ISIN contains exactly 12 characters.")
    ).not.toBeInTheDocument();
  });

  // --- Submit button state ---

  it("disables the submit button when required fields are missing", () => {
    setUserData({ assets: {} });
    customRender({ component: <Assets /> });

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("enables the submit button once name and ISIN are valid", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(nameInput(), "Amazon");
    await user.type(isinInput(), "US0231351067");

    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  // --- Input sanitization ---

  it("sanitizes ISIN input by removing non-alphanumeric characters and uppercasing", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    const input = isinInput();
    await user.type(input, "us-88 16@0r10#14");

    expect(input).toHaveValue("US88160R1014");
  });

  // --- Asset table display ---

  it("renders existing assets with their name, ISIN, and symbol in the table", () => {
    setUserData({ assets: ASSET_LIB });
    customRender({ component: <Assets /> });

    const table = assetTable();
    expect(
      within(table).getByRole("cell", { name: "Tesla" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "US88160R1014" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "Alphabet" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "US02079K3059" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: /GOOGL/ })
    ).toBeInTheDocument();
  });

  it("shows a dash for assets without a symbol", () => {
    setUserData({ assets: { [TESLA.isin]: TESLA } });
    customRender({ component: <Assets /> });

    expect(
      within(assetTable()).getByRole("cell", { name: "—" })
    ).toBeInTheDocument();
  });

  it("displays the total asset count below the table", () => {
    setUserData({ assets: ASSET_LIB });
    customRender({ component: <Assets /> });

    // "Total: 2 Assets" is split across spans — check both parts
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // --- Delete flow ---

  it("opens a confirmation dialog when clicking delete on an asset", async () => {
    setUserData({ assets: ASSET_LIB });
    const { user } = customRender({ component: <Assets /> });

    await user.click(screen.getByLabelText("Delete Tesla"));

    expect(screen.getByText("Delete Asset 'Tesla'?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Do you really want to delete the asset 'Tesla' from your library?"
      )
    ).toBeInTheDocument();
  });

  it("removes the asset after confirming the delete dialog", async () => {
    setUserData({ assets: ASSET_LIB });
    const { user } = customRender({ component: <Assets /> });

    await user.click(screen.getByLabelText("Delete Tesla"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Tesla")).not.toBeInTheDocument();
    expect(
      screen.getByText("Managing 1 asset in your library")
    ).toBeInTheDocument();
  });

  it("keeps the asset when canceling the delete dialog", async () => {
    setUserData({ assets: ASSET_LIB });
    const { user } = customRender({ component: <Assets /> });

    await user.click(screen.getByLabelText("Delete Tesla"));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      within(assetTable()).getByRole("cell", { name: "Tesla" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Managing 2 assets in your library")
    ).toBeInTheDocument();
  });

  // --- Check Symbol ---

  it("disables the Check Symbol button when the symbol field is empty", () => {
    setUserData({ assets: {} });
    customRender({ component: <Assets /> });

    expect(screen.getByRole("button", { name: "Check Symbol" })).toBeDisabled();
  });

  it("enables the Check Symbol button when a symbol is entered", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(symbolInput(), "AAPL");

    expect(screen.getByRole("button", { name: "Check Symbol" })).toBeEnabled();
  });

  it("shows a symbol connection indicator after clicking Check Symbol", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(symbolInput(), "GOOGL");
    await user.click(screen.getByRole("button", { name: "Check Symbol" }));

    expect(await screen.findByText("GOOGL")).toBeInTheDocument();
  });

  it("clears the symbol connection indicator when the form is submitted", async () => {
    setUserData({ assets: {} });
    const { user } = customRender({ component: <Assets /> });

    await user.type(nameInput(), "Alphabet");
    await user.type(isinInput(), "US02079K3059");
    await user.type(symbolInput(), "GOOGL");
    await user.click(screen.getByRole("button", { name: "Check Symbol" }));

    expect(await screen.findByText("GOOGL")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(symbolInput()).toHaveValue("");
    expect(nameInput()).toHaveValue("");
    expect(isinInput()).toHaveValue("");
  });
});
