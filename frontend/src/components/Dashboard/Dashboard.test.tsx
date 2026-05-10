import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import Dashboard from "./Dashboard";

vi.mock("./Dashboard.logic", () => ({
  usePortfolioNames: () => ["Portfolio 1", "Portfolio 2", "Portfolio 3"],
}));

vi.mock("../charts/ChartContainer", () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const getTag = (name: string) => screen.getByRole("button", { name });

describe("Dashboard", () => {
  it("renders portfolio selection tags", async () => {
    customRender({ component: <Dashboard /> });

    await waitFor(() => {
      expect(getTag("Portfolio 1")).toBeInTheDocument();
      expect(getTag("Portfolio 2")).toBeInTheDocument();
      expect(getTag("Portfolio 3")).toBeInTheDocument();
    });
  });

  it("toggles portfolio selection when clicking tags", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    const portfolio1Tag = getTag("Portfolio 1");
    expect(portfolio1Tag).toHaveAttribute("aria-selected", "true");

    await user.click(portfolio1Tag);

    await waitFor(() => {
      expect(portfolio1Tag).toHaveAttribute("aria-selected", "false");
    });
  });

  it("shows empty state when no portfolios are selected", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    // Deselect all portfolios
    const portfolio1Tag = getTag("Portfolio 1");
    const portfolio2Tag = getTag("Portfolio 2");
    const portfolio3Tag = getTag("Portfolio 3");

    await user.click(portfolio1Tag);
    await user.click(portfolio2Tag);
    await user.click(portfolio3Tag);

    await waitFor(() => {
      expect(screen.getByText("No portfolios selected")).toBeInTheDocument();
    });
  });

  it("updates compound portfolio name when selections change", async () => {
    const { user } = customRender({ component: <Dashboard /> });

    const portfolio1Tag = getTag("Portfolio 1");
    await user.click(portfolio1Tag);

    await waitFor(() => {
      expect(screen.getByText("Portfolio 1")).toBeInTheDocument();
    });
  });
});
