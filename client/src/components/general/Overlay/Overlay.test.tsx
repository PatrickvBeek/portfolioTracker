import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import Overlay from "./Overlay";

describe("the Overlay component", () => {
  const onClose = jest.fn();
  it("can be rendered with default props", () => {
    render(<Overlay onClose={onClose} />);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toBeInTheDocument();
  });
});
