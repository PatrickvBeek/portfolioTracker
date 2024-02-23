import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  TEST_ASSET_TESLA,
  TEST_PORTFOLIO,
} from "../../../domain/testConstants";
import {
  mockUseAddOrder,
  mockUseGetAssets,
  mockUseGetPortfolio,
} from "../../../testUtils";
import { OrderInputForm, OrderInputFormProps } from "./OrderInputFrom";

describe("The OrderInputForm", () => {
  const portfolioName = "portfolio-name";

  const PROPS: OrderInputFormProps = {
    portfolioName,
  };

  const TEST_ASSET = TEST_ASSET_TESLA;

  function fillValidOder(): void {
    render(<OrderInputForm {...PROPS} />);
    userEvent.click(screen.getByLabelText("Asset"));
    userEvent.click(screen.getByText(TEST_ASSET.displayName));
    userEvent.type(screen.getByLabelText("Pieces"), "4");
    userEvent.type(screen.getByLabelText("Fees"), "1");
    userEvent.type(screen.getByLabelText("Share Price"), "400");
  }

  beforeEach(() => {
    mockUseGetPortfolio.mockReturnValue({
      isLoading: false,
      isError: false,
      data: TEST_PORTFOLIO,
    });

    mockUseGetAssets.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { [TEST_ASSET.isin]: TEST_ASSET },
    });

    mockUseAddOrder.mockReturnValue({ mutate: vi.fn() });
  });
  it("can be instantiated", () => {
    <OrderInputForm {...PROPS} />;
  });

  it.each`
    label
    ${"Asset"}
    ${"Pieces"}
    ${"Share Price"}
    ${"Fees"}
    ${"Order Date"}
  `("renders an input element with label $label", ({ label }) => {
    render(<OrderInputForm {...PROPS} />);
    const inputElement = screen.getByLabelText(label);

    expect(inputElement).toBeInTheDocument();
  });

  it("renders a button with 'Submit' label", () => {
    render(<OrderInputForm {...PROPS} />);
    expect(screen.getByRole("button", { name: "Submit" })).toHaveTextContent(
      "Submit"
    );
  });

  it("only accepts an order if all mandatory fields are set", () => {
    render(<OrderInputForm {...PROPS} />);
    userEvent.click(screen.getByLabelText("Asset"));
    userEvent.click(screen.getByText(TEST_ASSET.displayName));
    userEvent.type(screen.getByLabelText("Pieces"), "4");

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    userEvent.type(screen.getByLabelText("Share Price"), "400");

    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("does not accept an order if it would sell more pieces than available", () => {
    render(<OrderInputForm {...PROPS} />);
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
