import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavigationBar, { NavigationBarProps } from "./NavigationBar";

describe("the NavigationBar component", () => {
  const onSelectMock = jest.fn();
  const TEST_PROPS: NavigationBarProps = {
    tabs: ["testTab1", "tab 2"],
    selectedTab: "testTab1",
    onSelect: onSelectMock,
  };

  beforeEach(() => {
    onSelectMock.mockClear();
  });

  it("renders a tablist", () => {
    render(<NavigationBar {...TEST_PROPS} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders a tab for all tabs specified in the props", () => {
    render(<NavigationBar {...TEST_PROPS} />);
    expect(
      screen.getAllByRole("tab").map((element) => element.textContent)
    ).toEqual(TEST_PROPS.tabs);
  });

  it("calls the callback when a tab is clicked", () => {
    const testTab = TEST_PROPS.tabs[1];
    render(<NavigationBar {...TEST_PROPS} />);
    const tab = screen.getByRole("tab", { name: testTab });
    userEvent.click(tab);
    expect(onSelectMock).toHaveBeenCalledWith(testTab);
  });
});
