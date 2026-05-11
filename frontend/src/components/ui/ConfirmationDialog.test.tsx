import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { customRender } from "../../testUtils/componentHelpers";
import { ConfirmationDialog } from "./ConfirmationDialog";

describe("the confirmation component", () => {
  const PROPS = {
    open: true,
    title: "test title",
    body: "something evil will happen, do you want to continue?",
    confirmLabel: "yeah!",
    cancelLabel: "nooooo!",
    onConfirm: vi.fn<() => void>(),
    onCancel: vi.fn<() => void>(),
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
    customRender({ component: <ConfirmationDialog {...PROPS} /> });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("renders the title", () => {
    customRender({ component: <ConfirmationDialog {...PROPS} /> });
    expect(screen.getByRole("alertdialog").textContent).toContain(PROPS.title);
  });

  it("renders the dialog description text", () => {
    customRender({ component: <ConfirmationDialog {...PROPS} /> });
    expect(screen.getByRole("alertdialog").textContent).toContain(PROPS.body);
  });

  it("renders a confirmation button with given label", () => {
    customRender({ component: <ConfirmationDialog {...PROPS} /> });
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeInTheDocument();
  });

  it("renders a cancel button with given label", () => {
    customRender({ component: <ConfirmationDialog {...PROPS} /> });
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeInTheDocument();
  });

  it("triggers the onConfirm callback when the user confirms", async () => {
    const { user } = customRender({
      component: <ConfirmationDialog {...PROPS} />,
    });
    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeDefined();
    await user.click(confirmButton!);
    expect(PROPS.onConfirm).toHaveBeenCalled();
  });

  it("triggers the onCancel callback when the user aborts via button", async () => {
    const { user } = customRender({
      component: <ConfirmationDialog {...PROPS} />,
    });
    const cancelButton = getCancelButton();
    expect(cancelButton).toBeDefined();
    await user.click(cancelButton!);
    expect(PROPS.onCancel).toHaveBeenCalled();
  });
});
