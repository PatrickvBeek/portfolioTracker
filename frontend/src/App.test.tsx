import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

globalThis.URL.createObjectURL = vi
  .fn<() => string>()
  .mockReturnValue("fake/url");

test("App renders a navigation", () => {
  render(<App />);
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});
