import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  mockUseAddPortfolio,
  mockUseDeletePortfolio,
} from "../../../testUtils";
import PortfolioActionsBar from "./PortfolioActionsBar";

describe("the portfolio sidebar", () => {
  const TEST_PROPS = {
    portfolioName: "test-portfolio",
  };

  beforeEach(() => {
    mockUseDeletePortfolio.mockReturnValue({ mutate: vi.fn() });
    mockUseAddPortfolio.mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it("renders the headings", () => {
    render(<PortfolioActionsBar {...TEST_PROPS} />);
    expect(screen.getByRole("columnheader").textContent).toEqual("Actions");
  });

  it("can add a portfolio", () => {
    render(<PortfolioActionsBar {...TEST_PROPS} />);
    const addButton = screen.getByText("Add Portfolio");
    expect(addButton).toBeInTheDocument();

    userEvent.click(addButton);

    expect(screen.getByText("Add a new Portfolio")).toBeInTheDocument();
  });

  it("can delete a portfolio", () => {
    render(<PortfolioActionsBar {...TEST_PROPS} />);
    const deleteButton = screen.getByText("Delete Portfolio");
    expect(deleteButton).toBeInTheDocument();

    userEvent.click(deleteButton);

    expect(
      screen.getByText("You are about to delete", { exact: false })
    ).toBeInTheDocument();
  });
});
