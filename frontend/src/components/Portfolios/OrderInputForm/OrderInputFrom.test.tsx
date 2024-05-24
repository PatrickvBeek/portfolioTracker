import { screen } from "@testing-library/react";
import {
  TEST_ASSET_LIB,
  TEST_ASSET_TESLA,
  TEST_PORTFOLIO,
  TEST_PORTFOLIO_LIB,
} from "../../../../../domain/src/testConstants";
import { getComponentTest } from "../../../testUtils/componentTestBuilder";
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

  async function fillValidOder(): Promise<void> {
    await test.user.click(await screen.findByLabelText("Asset"));
    await test.user.click(await screen.findByText(TEST_ASSET.displayName));
    await test.user.type(await screen.findByLabelText("Pieces"), "4");
    await test.user.type(await screen.findByLabelText("Fees"), "1");
    await test.user.type(await screen.findByLabelText("Share Price"), "400");
  }

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
    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toHaveTextContent("Submit");
  });

  it("only accepts an order if all mandatory fields are set", async () => {
    await test.user.click(await screen.findByLabelText("Asset"));
    await test.user.click(await screen.findByText(TEST_ASSET.displayName));
    await test.user.type(await screen.findByLabelText("Pieces"), "4");

    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toBeDisabled();

    await test.user.type(await screen.findByLabelText("Share Price"), "400");

    expect(await screen.findByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("does not accept an order if it would sell more pieces than available", async () => {
    await test.user.click(await screen.findByLabelText("Asset"));
    await test.user.click(await screen.findByText(TEST_ASSET.displayName));
    await test.user.type(await screen.findByLabelText("Share Price"), "400");

    await test.user.type(await screen.findByLabelText("Pieces"), "4");

    expect(await screen.findByRole("button", { name: "Submit" })).toBeEnabled();

    await test.user.clear(await screen.findByLabelText("Pieces"));
    await test.user.type(await screen.findByLabelText("Pieces"), "-3");
    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toBeDisabled();
  });

  it("renders a summary text", async () => {
    await fillValidOder();

    expect(screen.getByTitle("Summary Text")).toHaveTextContent(
      "4 x 400 + 1 = 1601.00"
    );
  });
});
