import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { getComponentTest } from "../../testUtils/componentTestBuilder";
import NavigationBar, { NavigationBarProps } from "./NavigationBar";

describe("the NavigationBar component", () => {
  const onSelectMock = vi.fn();
  const TEST_PROPS: NavigationBarProps = {
    tabs: ["testTab1", "tab 2"],
    selectedTab: "testTab1",
    onSelect: onSelectMock,
  };

  const test = getComponentTest({ element: <NavigationBar {...TEST_PROPS} /> });

  it("renders a tablist", () => {
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders a tab for all tabs specified in the props", () => {
    expect(
      screen.getAllByRole("tab").map((element) => element.textContent)
    ).toEqual(TEST_PROPS.tabs);
  });

  it("calls the callback when a tab is clicked", async () => {
    const testTab = TEST_PROPS.tabs[1];
    const tab = await screen.findByRole("tab", { name: testTab });
    await test.user.click(tab);
    expect(onSelectMock).toHaveBeenCalledWith(testTab);
  });
});
