import { act } from "@testing-library/react";
import { vi } from "vitest";
import { customRenderHook } from "../testUtils/componentHelpers";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports pending until the timer commits the new value", () => {
    let value = "first";
    const { result, rerender } = customRenderHook(() =>
      useDebouncedValue(value, 500)
    );

    expect(result.current.value).toBe("first");
    expect(result.current.isPending).toBe(false);

    value = "second";
    rerender();

    expect(result.current.value).toBe("first");
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.value).toBe("second");
    expect(result.current.isPending).toBe(false);
  });
});
