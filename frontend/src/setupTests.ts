import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { resetMockNetwork, server } from "./testUtils/networkMock";

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return index < keys.length ? keys[index] : null;
    },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
beforeEach(() => {
  resetMockNetwork();
});
afterAll(() => server.close());
