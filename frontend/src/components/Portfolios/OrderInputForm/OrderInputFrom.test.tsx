import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TEST_ASSET_LIB,
  TEST_ASSET_TESLA,
  TEST_PORTFOLIO,
  TEST_PORTFOLIO_LIB,
} from "../../../../../domain/testConstants";
import { getComponentTest } from "../../../testUtils/componentTestRunner";
import { OrderInputForm, OrderInputFormProps } from "./OrderInputFrom";

describe("The OrderInputForm", () => {
  const portfolioName = TEST_PORTFOLIO.name;

  const PROPS: OrderInputFormProps = {
    portfolioName,
  };

  const TEST_ASSET = TEST_ASSET_TESLA;

  const test = getComponentTest({
    element: <OrderInputForm {...PROPS} />,
    mockData: { portfolioLib: TEST_PORTFOLIO_LIB, assetLib: TEST_ASSET_LIB },
  });

  function fillValidOder(): void {
    userEvent.click(screen.getByLabelText("Asset"));
    userEvent.click(screen.getByText(TEST_ASSET.displayName));
    userEvent.type(screen.getByLabelText("Pieces"), "4");
    userEvent.type(screen.getByLabelText("Fees"), "1");
    userEvent.type(screen.getByLabelText("Share Price"), "400");
  }

  beforeAll(() => test.server.listen());
  beforeEach(() => {
    test.server.resetHandlers();
    test.render();
  });
  afterAll(() => test.server.close());

  it.each`
    label
    ${"Asset"}
    ${"Pieces"}
    ${"Share Price"}
    ${"Fees"}
    ${"Order Date"}
  `("renders an input element with label $label", async ({ label }) => {
    expect(await screen.findByLabelText(label)).toBeInTheDocument();
  });

  it("renders a button with 'Submit' label", async () => {
    expect(screen.getByRole("button", { name: "Submit" })).toHaveTextContent(
      "Submit"
    );
  });

  it("only accepts an order if all mandatory fields are set", () => {
    userEvent.click(screen.getByLabelText("Asset"));
    userEvent.click(screen.getByText(TEST_ASSET.displayName));
    userEvent.type(screen.getByLabelText("Pieces"), "4");

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    userEvent.type(screen.getByLabelText("Share Price"), "400");

    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("does not accept an order if it would sell more pieces than available", () => {
    userEvent.click(screen.getByLabelText("Asset"));
    userEvent.click(screen.getByText(TEST_ASSET.displayName));
    userEvent.type(screen.getByLabelText("Share Price"), "400");

    userEvent.type(screen.getByLabelText("Pieces"), "4");

    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();

    userEvent.clear(screen.getByLabelText("Pieces"));
    userEvent.type(screen.getByLabelText("Pieces"), "-3");
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("renders a summary text", () => {
    fillValidOder();
    expect(screen.getByTitle("Summary Text")).toHaveTextContent(
      "4 x 400 + 1 = 1601.00"
    );
  });
});
