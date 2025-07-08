import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { customRender } from "../../../testUtils/componentHelpers";
import { InfoDialog, InfoDialogProps } from "./InfoDialog";

describe("InfoDialog", () => {
  const defaultProps: InfoDialogProps = {
    open: true,
    onClose: vi.fn(),
    title: "Test Title",
    message: "Test message content",
  };

  it("renders when open is true", () => {
    customRender({ component: <InfoDialog {...defaultProps} /> });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message content")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    customRender({ component: <InfoDialog {...defaultProps} open={false} /> });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with custom action label", () => {
    customRender({
      component: <InfoDialog {...defaultProps} actionLabel="Got it" />,
    });

    expect(screen.getByText("Got it")).toBeInTheDocument();
  });

  it("renders with default OK label when no action label provided", () => {
    customRender({ component: <InfoDialog {...defaultProps} /> });

    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders ReactNode message content", () => {
    const messageNode = (
      <div>
        <strong>Important:</strong> This is a test message
      </div>
    );

    customRender({
      component: <InfoDialog {...defaultProps} message={messageNode} />,
    });

    expect(screen.getByText("Important:")).toBeInTheDocument();
    expect(screen.getByText("This is a test message")).toBeInTheDocument();
  });

  it("calls onClose when OK button is clicked", async () => {
    const mockOnClose = vi.fn();
    const { user } = customRender({
      component: <InfoDialog {...defaultProps} onClose={mockOnClose} />,
    });

    const okButton = screen.getByText("OK");
    await user.click(okButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", async () => {
    const mockOnClose = vi.fn();
    const { user } = customRender({
      component: <InfoDialog {...defaultProps} onClose={mockOnClose} />,
    });

    await user.keyboard("{Escape}");

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the OK button by default", () => {
    customRender({ component: <InfoDialog {...defaultProps} /> });

    const okButton = screen.getByText("OK");
    expect(okButton).toHaveFocus();
  });
});
