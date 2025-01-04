import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

global.URL.createObjectURL = vi.fn().mockReturnValue("fake/url");

test("App renders a navigation", () => {
  render(<App />);
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});
