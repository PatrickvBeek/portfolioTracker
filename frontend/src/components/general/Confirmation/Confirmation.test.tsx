import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Confirmation, { ConfirmationProps } from "./Confirmation";

describe("the confirmation component", () => {
  const PROPS: ConfirmationProps = {
    title: "test title",
    body: "something evil will happen, do you want to continue?",
    confirmLabel: "yeah!",
    cancelLabel: "nooooo!",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  function getConfirmButton(): HTMLElement | undefined {
    return screen
      .getAllByRole("button")
      .find((el) => el.textContent === PROPS.confirmLabel);
  }

  function getCancelButton(): HTMLElement | undefined {
    return screen
      .getAllByRole("button")
      .find((el) => el.textContent === PROPS.cancelLabel);
  }

  it("renders an overlay", () => {
    render(<Confirmation {...PROPS} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<Confirmation {...PROPS} />);
    expect(screen.getByRole("dialog").textContent).toContain(PROPS.title);
  });

  it("renders the dialog description text", () => {
    render(<Confirmation {...PROPS} />);
    expect(screen.getByRole("dialog").textContent).toContain(PROPS.body);
  });

  it("renders a confirmation button with given label", () => {
    render(<Confirmation {...PROPS} />);
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeInTheDocument();
  });

  it("renders a cancel button with given label", () => {
    render(<Confirmation {...PROPS} />);
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeInTheDocument();
  });

  it("triggers the onConfirm callback when the user confirms", () => {
    render(<Confirmation {...PROPS} />);
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeDefined();
    userEvent.click(confirmButton!);
    expect(PROPS.onConfirm).toHaveBeenCalled();
  });

  it("triggers the onCancel callback when the user aborts via button", () => {
    render(<Confirmation {...PROPS} />);
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeDefined();
    userEvent.click(cancelButton!);
    expect(PROPS.onCancel).toHaveBeenCalled();
  });
});
