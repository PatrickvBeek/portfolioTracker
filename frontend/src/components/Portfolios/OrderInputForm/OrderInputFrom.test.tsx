import { act, screen } from "@testing-library/react";
import {
  TEST_ASSET_LIB,
  TEST_ASSET_TESLA,
  TEST_ORDER_TESLA,
  TEST_PORTFOLIO,
  TEST_PORTFOLIO_LIB,
} from "../../../../../domain/src/testConstants";
import { customRender } from "../../../testUtils/componentHelpers";
import { mockNetwork } from "../../../testUtils/networkMock";
import { OrderInputForm, OrderInputFormProps } from "./OrderInputFrom";

describe("The OrderInputForm", () => {
  const PROPS: OrderInputFormProps = {
    portfolioName: TEST_PORTFOLIO.name,
  };

  const TEST_ASSET = TEST_ASSET_TESLA;

  mockNetwork({ portfolioLib: TEST_PORTFOLIO_LIB, assetLib: TEST_ASSET_LIB });

  it.each`
    label
    ${"Asset"}
    ${"Pieces"}
    ${"Share Price"}
    ${"Fees"}
    ${"Order Date"}
  `("renders an input element with label $label", async ({ label }) => {
    customRender({
      component: <OrderInputForm {...PROPS} />,
    });
    expect(await screen.findByLabelText(label)).toBeInTheDocument();
  });

  it("renders a button with 'Submit' label", async () => {
    customRender({
      component: <OrderInputForm {...PROPS} />,
    });
    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toHaveTextContent("Submit");
  });

  it("only accepts an order if all mandatory fields are set", async () => {
    const { fillNumberInput, selectAsset } = customRender({
      component: <OrderInputForm {...PROPS} />,
    });

    expect(await screen.findByLabelText("Pieces")).toBeInTheDocument();
    await fillNumberInput({ label: "Pieces", value: "4" });
    await selectAsset(TEST_ASSET.displayName);

    expect(
      await screen.findByRole("button", { name: "Submit" })
    ).toBeDisabled();

    await fillNumberInput({ label: "Share Price", value: "400" });

    expect(await screen.findByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("does not accept an order if it would sell more pieces than available", async () => {
    const { user, fillNumberInput, selectAsset } = customRender({
      component: <OrderInputForm {...PROPS} />,
    });
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
    const { fillNumberInput, selectAsset } = customRender({
      component: <OrderInputForm {...PROPS} />,
    });

    await selectAsset(TEST_ASSET.displayName);
    await fillNumberInput({ label: "Pieces", value: "4" });
    await fillNumberInput({ label: "Fees", value: "1" });
    await fillNumberInput({ label: "Share Price", value: "400" });

    expect(screen.getByTitle("Summary Text")).toHaveTextContent(
      "4 x 400 + 1 = 1601.00"
    );
  });

  it("shows a warning if the user tries to add a duplicate order", async () => {
    const { selectAsset, fillNumberInput, user } = customRender({
      component: <OrderInputForm {...PROPS} />,
    });

    await selectAsset(TEST_ASSET.displayName);
    await fillNumberInput({
      label: "Pieces",
      value: `${TEST_ORDER_TESLA.pieces}`,
    });
    await fillNumberInput({
      label: "Fees",
      value: `${TEST_ORDER_TESLA.orderFee}`,
    });
    await fillNumberInput({
      label: "Share Price",
      value: `${TEST_ORDER_TESLA.sharePrice}`,
    });
    const dateInput = await screen.findByLabelText("Order Date");

    await user.clear(dateInput);

    await user.type(
      await screen.findByLabelText("Order Date"),
      `${TEST_ORDER_TESLA.timestamp}`
    );
    await act(async () => {
      await user.click(await screen.findByRole("button", { name: "Submit" }));
    });

    expect(
      await screen.findByText(/duplicate order detected!/i)
    ).toBeInTheDocument();
  });
});
