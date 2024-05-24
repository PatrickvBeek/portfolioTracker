import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { componentHelpers } from "../../../testUtils/componentHelper";
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
    expect(field).toHaveValue("123");
  });

  it("can delete a character with backspace", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("12");
    expect(field).toHaveValue("12");
    await fillInput("{Backspace}");
    expect(field).toHaveValue("1");
  });

  it("last character can be deleted", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("12");
    expect(field).toHaveValue("12");
    await fillInput("{Backspace} {Backspace}");
    expect(field).toHaveValue("");
  });

  it("accepts decimal numbers with '.' as separator", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("1.77");
    expect(field).toHaveValue("1.77");
  });

  it("correctly parses a number ending in '.'", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("2.");
    expect(field).toHaveValue("2.");
  });

  it("can limit the number of digits", async () => {
    render(<NumberInput {...PROPS} digits={3} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("1.7734545");
    expect(field).toHaveValue("1.773");
  });

  it("accepts negative numbers", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("-1.7");
    expect(field).toHaveValue("-1.7");
  });

  it("accepts numbers starting with a decimal point", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput(".7");
    expect(field).toHaveValue("0.7");
  });

  it("accepts negative numbers starting with a decimal point", async () => {
    render(<NumberInput {...PROPS} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("-.7");
    expect(field).toHaveValue("-0.7");
  });

  it("can be prefilled with a default value", () => {
    render(<NumberInput {...PROPS} defaultValue={1.4} />);
    const field = screen.getByLabelText(LABEL);
    expect(field).toHaveValue("1.4");
  });

  it("crops the default value to the specified number of digits", () => {
    render(<NumberInput {...PROPS} defaultValue={1.442} digits={2} />);
    const field = screen.getByLabelText(LABEL);
    expect(field).toHaveValue("1.44");
  });

  it("can modify a given defaultValue", async () => {
    render(<NumberInput {...PROPS} defaultValue={1.4} digits={3} />);
    const field = screen.getByLabelText(LABEL);
    await fillInput("{Backspace}{Backspace}");
    expect(field).toHaveValue("1");
    expect(onChangeMock).toHaveBeenLastCalledWith(1);
  });

  describe("sets the value to undefined if the user input is", () => {
    it("empty", async () => {
      render(<NumberInput {...PROPS} />);
      const field = screen.getByLabelText(LABEL);
      await fillInput("1{Backspace}");
      expect(field).toHaveValue("");
      expect(onChangeMock.mock.calls).toEqual([[1], [undefined]]);
    });

    it("not a valid number, but a potential number", async () => {
      render(<NumberInput {...PROPS} />);
      const field = screen.getByLabelText(LABEL);
      await fillInput("-");
      expect(field).toHaveValue("-");
      expect(onChangeMock.mock.calls).toEqual([[undefined]]);
    });
  });
});
