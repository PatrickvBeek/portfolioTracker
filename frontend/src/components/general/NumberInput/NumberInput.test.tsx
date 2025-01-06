import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { componentHelpers } from "../../../testUtils/componentHelpers";
import { NumberInput, NumberInputProps } from "./NumberInput";

const LABEL = "test label";

describe("the NumberInput component", () => {
  const onChangeMock = vi.fn();
  const PROPS: NumberInputProps = { onChange: onChangeMock, label: LABEL };
  const user = userEvent.setup();
  const { fillNumberInput } = componentHelpers(user);
  const fillInput = async (value: string) => {
    await fillNumberInput({ label: LABEL, value });
  };

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it("can be initialized", () => {
    render(<NumberInput onChange={() => {}} label={LABEL} />);
    expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
  });

  it("ignores input of letters", async () => {
    render(<NumberInput {...PROPS} />);
    const field = await screen.findByLabelText(LABEL);
    await fillInput("12ab3");
    expect(field).toHaveValue(123);
  });

  it("can delete a character with backspace", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("12");
    expect(field).toHaveValue(12);
    await fillInput("{Backspace}");
    expect(field).toHaveValue(1);
  });

  it("last character can be deleted", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("12");
    expect(field).toHaveValue(12);
    await fillInput("{Backspace} {Backspace}");
    expect(field).toHaveValue(null);
  });

  it("accepts decimal numbers with '.' as separator", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("1.77");
    expect(field).toHaveValue(1.77);
  });

  it("correctly parses a number ending in '.'", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("2.");
    expect(field).toHaveValue(2);
  });

  it("accepts negative numbers", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("-1.7");
    expect(field).toHaveValue(-1.7);
  });

  it("accepts numbers starting with a decimal point", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput(".7");
    expect(field).toHaveValue(0.7);
  });

  it("accepts negative numbers starting with a decimal point", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("-.7");
    expect(field).toHaveValue(-0.7);
  });

  it("can be prefilled with a default value", () => {
    render(<NumberInput {...PROPS} defaultValue={1.4} />);
    const field = screen.getByLabelText(LABEL);
    expect(field).toHaveValue(1.4);
  });

  it("can modify a given defaultValue", async () => {
    render(<NumberInput {...PROPS} defaultValue={1.4} />);
    await fillInput("{Backspace}");
    expect(onChangeMock).toHaveBeenLastCalledWith(1);
  });

  it("empty", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("1{Backspace}");
    expect(field).toHaveValue(null);
    expect(onChangeMock.mock.calls).toEqual([[1], [undefined]]);
  });
});
