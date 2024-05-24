import { act, screen } from "@testing-library/react";
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

  const { user, fillNumberInput, selectAsset } = getComponentTest({
    element: <OrderInputForm {...PROPS} />,
    mockData: { portfolioLib: TEST_PORTFOLIO_LIB, assetLib: TEST_ASSET_LIB },
  });

  async function fillValidOder(): Promise<void> {
    await selectAsset(TEST_ASSET.displayName);
    await fillNumberInput({ label: "Pieces", value: "4" });
    await fillNumberInput({ label: "Fees", value: "1" });
    await fillNumberInput({ label: "Share Price", value: "400" });
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
    await fillNumberInput({ label: "Pieces", value: "4" });
    await selectAsset(TEST_ASSET.displayName);

    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toBeDisabled();

    await fillNumberInput({ label: "Share Price", value: "400" });

    expect(await screen.findByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("does not accept an order if it would sell more pieces than available", async () => {
    await selectAsset(TEST_ASSET.displayName);
    await fillNumberInput({ label: "Share Price", value: "400" });
    await fillNumberInput({ label: "Pieces", value: "4" });

    expect(await screen.findByRole("button", { name: "Submit" })).toBeEnabled();

    await act(async () => {
      await user.clear(await screen.findByLabelText("Pieces"));
    });
    await fillNumberInput({ label: "Pieces", value: "-4" });
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
