import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TextInput, TextInputProps } from "./TextInput";

const TEST_LABEL = "test-label";

describe("the text TextInput component", () => {
  const errorMessage = "test-error-message";
  const onChangeMock = vi.fn();
  const testProps: TextInputProps = {
    text: "test-text",
    isValid: true,
    isMandatory: true,
    errorMessage: errorMessage,
    label: TEST_LABEL,
    onChange: onChangeMock,
  };

  test("can be rendered", () => {
    render(<TextInput {...testProps} />);
    const field = screen.getByLabelText(TEST_LABEL);
    expect(field).toBeVisible();
  });

  test("renders a label, when given", () => {
    render(<TextInput {...testProps} />);
    expect(screen.getByText("test-label")).toBeVisible();
  });

  test("renders no label, when not given", () => {
    render(<TextInput {...{ ...testProps, label: undefined }} />);
    expect(screen.queryByText("test-label")).toBeNull();
  });

  test("renders error message when invalid", () => {
    render(<TextInput {...{ ...testProps, isValid: false }} />);
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  test("renders no error message when valid", () => {
    render(<TextInput {...{ ...testProps, isValid: true }} />);
    expect(screen.queryByText(errorMessage)).toBeNull();
  });
});
