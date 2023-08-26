import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortfolioViewSideBar from "./PortfolioViewSideBar";

describe("the portfolio sidebar", () => {
  const onClickMock1 = jest.fn();
  const onClickMock2 = jest.fn();
  const TEST_PROPS = {
    heading: "Test Heading",
    entries: [
      { label: "test entry 1", action: onClickMock1 },
      { label: "test entry 2", action: onClickMock2 },
    ],
  };

  it("renders the headings", () => {
    render(<PortfolioViewSideBar {...TEST_PROPS} />);
    expect(screen.getByRole("columnheader").textContent).toEqual(
      "Test Heading"
    );
  });

  it("renders the correct labels for entries", () => {
    render(<PortfolioViewSideBar {...TEST_PROPS} />);
    expect(screen.getAllByRole("menuitem").map((el) => el.textContent)).toEqual(
      ["test entry 1", "test entry 2"]
    );
  });

  it("calls the onClick callback for the corresponding entries", () => {
    render(<PortfolioViewSideBar {...TEST_PROPS} />);
    screen.getAllByRole("menuitem").map((el) => userEvent.click(el));
    expect(onClickMock1).toBeCalledTimes(1);
    expect(onClickMock2).toBeCalledTimes(1);
  });
});
