import { screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import Dashboard from "./Dashboard";

vi.mock("./Dashboard.logic", () => ({
  usePortfolioNames: () => ["Portfolio 1", "Portfolio 2", "Portfolio 3"],
}));

vi.mock("recharts", async () => {
  const original = await vi.importActual("recharts");
  return {
    ...original,
    ResponsiveContainer: () => createElement("div"),
  };
});

const getChip = (name: string) => screen.getByRole("button", { name });

describe("Dashboard", () => {
  it("renders portfolio selection chips", async () => {
    customRender({ component: <Dashboard /> });

    await waitFor(() => {
      expect(getChip("Portfolio 1")).toBeInTheDocument();
      expect(getChip("Portfolio 2")).toBeInTheDocument();
      expect(getChip("Portfolio 3")).toBeInTheDocument();
    });
  });

  it("toggles portfolio selection when clicking chips", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    const portfolio1Chip = getChip("Portfolio 1");
    expect(portfolio1Chip).toHaveAttribute("aria-selected", "true");

    await user.click(portfolio1Chip);

    await waitFor(() => {
      expect(portfolio1Chip).toHaveAttribute("aria-selected", "false");
    });
  });

  it("shows empty state when no portfolios are selected", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    // Deselect all portfolios
    const portfolio1Chip = getChip("Portfolio 1");
    const portfolio2Chip = getChip("Portfolio 2");
    const portfolio3Chip = getChip("Portfolio 3");

    await user.click(portfolio1Chip);
    await user.click(portfolio2Chip);
    await user.click(portfolio3Chip);

    await waitFor(() => {
      expect(screen.getByText("No portfolios selected")).toBeInTheDocument();
    });
  });

  it("updates compound portfolio name when selections change", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    const portfolio1Chip = getChip("Portfolio 1");
    await user.click(portfolio1Chip);

    await waitFor(() => {
      expect(screen.getByText("Portfolio 1")).toBeInTheDocument();
    });
  });
});
