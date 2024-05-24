import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { getComponentTest } from "../../../testUtils/componentTestBuilder";
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

  const { user } = getComponentTest({ element: <Confirmation {...PROPS} /> });

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
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the title", () => {
    expect(screen.getByRole("dialog").textContent).toContain(PROPS.title);
  });

  it("renders the dialog description text", () => {
    expect(screen.getByRole("dialog").textContent).toContain(PROPS.body);
  });

  it("renders a confirmation button with given label", () => {
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeInTheDocument();
  });

  it("renders a cancel button with given label", () => {
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeInTheDocument();
  });

  it("triggers the onConfirm callback when the user confirms", async () => {
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeDefined();
    await user.click(confirmButton!);
    expect(PROPS.onConfirm).toHaveBeenCalled();
  });

  it("triggers the onCancel callback when the user aborts via button", async () => {
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeDefined();
    await user.click(cancelButton!);
    expect(PROPS.onCancel).toHaveBeenCalled();
  });
});
