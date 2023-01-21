import { render, screen } from "@testing-library/react";
import App from "./App";

test("App renders a navbar", () => {
  render(<App />);
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});
