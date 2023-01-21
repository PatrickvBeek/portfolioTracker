import { render, screen } from "@testing-library/react";
import { DateInput, DateInputProps } from "./DateInput";

const LABEL = "label";

describe("the DateInput component", () => {
  const errorMessage = "test-error-message";
  const onChangeMock = jest.fn();
  const testProps: DateInputProps = {
    isValid: true,
    isMandatory: true,
    errorMessage: errorMessage,
    label: LABEL,
    defaultDate: new Date("2022-01-24"),
    onChange: onChangeMock,
  };

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  test("renders a label, when given", () => {
    render(<DateInput {...testProps} />);
    expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
  });

  test("renders no label, when not given", () => {
    render(<DateInput {...{ ...testProps, label: undefined }} />);
    expect(screen.queryByLabelText(LABEL)).toBeNull();
  });

  test("renders error message when invalid", () => {
    render(<DateInput {...{ ...testProps, isValid: false }} />);
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  test("renders no error message when valid", () => {
    render(<DateInput {...{ ...testProps, isValid: true }} />);
    expect(screen.queryByText(errorMessage)).toBeNull();
  });

  it("renders a default Date, when given", () => {
    render(<DateInput {...testProps} />);
    expect(screen.getByLabelText(LABEL)).toHaveValue("2022-01-24");
  });

  it("renders no Date, when no default given", () => {
    render(<DateInput {...testProps} defaultDate={undefined} />);
    expect(screen.getByLabelText(LABEL)).toHaveValue("");
    expect(onChangeMock).not.toHaveBeenCalled();
  });
});
