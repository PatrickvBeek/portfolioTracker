import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./TransactionInputForm";
import TransactionInputForm from "./TransactionInputForm";

const DUMMY_ON_SUBMIT = jest.fn();

describe("the TransactionInputForm", () => {
  it("can be mounted", () => {
    render(<TransactionInputForm onSubmit={DUMMY_ON_SUBMIT} />);
  });

  it("renders input elements with label 'transaction type'", () => {
    render(<TransactionInputForm onSubmit={DUMMY_ON_SUBMIT} />);
    expect(screen.getByLabelText(/Transaction Type/i)).toBeInTheDocument();
  });

  it("renders input elements with label 'amount'", () => {
    render(<TransactionInputForm onSubmit={DUMMY_ON_SUBMIT} />);
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<TransactionInputForm onSubmit={DUMMY_ON_SUBMIT} />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("calls the callback function when the submit button is pressed", () => {
    const submitMock = jest.fn();
    render(<TransactionInputForm onSubmit={submitMock} />);
    userEvent.type(screen.getByLabelText(/amount/i), "10");
    const button = screen.getByRole("button", { name: /submit/i });
    userEvent.click(button);
    expect(submitMock).toHaveBeenCalled();
  });
});
