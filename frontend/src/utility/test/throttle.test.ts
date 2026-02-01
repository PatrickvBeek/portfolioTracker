import { vi } from "vitest";
import { throttle } from "../throttle";

describe("throttle", () => {
  vi.useFakeTimers();

  it("executes first call immediately", async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const throttledFn = throttle(fn, 100);

    const promise = throttledFn(5);

    vi.advanceTimersByTime(0);
    await promise;

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(5);
  });

  it("delays second call until minimum interval elapses", async () => {
    const callback = vi.fn(async (x: number) => x * 2);
    const throttledFn = throttle(callback, 100);

    const promise1 = throttledFn(5);
    const promise2 = throttledFn(10);

    await vi.advanceTimersByTimeAsync(50);
    await promise1;

    expect(callback).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(50);
    await promise2;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 5);
    expect(callback).toHaveBeenNthCalledWith(2, 10);
  });

  it("queues concurrent requests and executes them sequentially", async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const throttledFn = throttle(fn, 100);

    const promises = [throttledFn(1), throttledFn(2), throttledFn(3)];

    vi.advanceTimersByTimeAsync(250);
    await Promise.all(promises);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, 1);
    expect(fn).toHaveBeenNthCalledWith(2, 2);
    expect(fn).toHaveBeenNthCalledWith(3, 3);
  });

  it("respects minimum interval after previous call completes", async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const throttledFn = throttle(fn, 100);

    const promise1 = throttledFn(5);
    await vi.advanceTimersByTimeAsync(50);
    await promise1;

    const promise2 = throttledFn(10);
    await vi.advanceTimersByTimeAsync(50);

    await promise2;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("maintains return values", async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const throttledFn = throttle(fn, 100);

    const result1 = throttledFn(3);
    vi.advanceTimersByTimeAsync(50);
    const result2 = throttledFn(4);
    vi.advanceTimersByTimeAsync(50);

    const value1 = await result1;
    const value2 = await result2;

    expect(value1).toBe(6);
    expect(value2).toBe(8);
  });

  it("handles async functions correctly", async () => {
    const fn = vi.fn(async (x: number) => {
      await new Promise<void>((resolve) => resolve());
      return x * 2;
    });
    const throttledFn = throttle(fn, 100);

    const promises = [throttledFn(1), throttledFn(2)];

    vi.advanceTimersByTimeAsync(150);
    await Promise.all(promises);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
