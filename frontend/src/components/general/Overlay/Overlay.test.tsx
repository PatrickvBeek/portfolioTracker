import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Overlay from "./Overlay";

describe("the Overlay component", () => {
  const onClose = vi.fn();

  it("can be rendered with default props", () => {
    render(<Overlay open={true} onClose={onClose} />);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toBeInTheDocument();
  });

  it("renders the title if provided", () => {
    render(<Overlay open={true} onClose={onClose} title="Test Title" />);
    const title = screen.getByText("Test Title");
    expect(title).toBeInTheDocument();
  });

  it("renders children if provided", () => {
    render(
      <Overlay open={true} onClose={onClose}>
        <p>Test Child</p>
      </Overlay>
    );
    const child = screen.getByText("Test Child");
    expect(child).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<Overlay open={true} onClose={onClose} />);
    const closeButton = screen.getByLabelText("close");
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });
});
