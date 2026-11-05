import { QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent, { Options, UserEvent } from "@testing-library/user-event";
import { ReactElement } from "react";
import { CustomQuery } from "../hooks/prices/priceHooks";
import { UserDataProvider } from "../userDataContext";
import { createTestQueryClient } from "./queryClient";

export function customRenderHook<T>(hookCallback: () => T) {
  const queryClient = createTestQueryClient();
  const renderResult = renderHook(hookCallback, {
    wrapper: ({ children }) => (
      <UserDataProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </UserDataProvider>
    ),
  });
  return { ...renderResult, queryClient };
}

export function customRender({
  component,
  userEventOptions,
}: {
  component: ReactElement;
  userEventOptions?: Options;
}) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup(userEventOptions);
  const renderResult = render(
    <UserDataProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </UserDataProvider>
  );

  return {
    user,
    renderResult,
    ...componentHelpers(user),
  };
}

export const componentHelpers = (user: UserEvent) => ({
  fillNumberInput: async ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => {
    await user.type(await screen.findByLabelText(label), value);
  },
  selectAsset: async (assetName: string) => {
    const assetInput = await screen.findByLabelText("Asset");
    await user.click(assetInput);
    await user.click(await screen.findByText(assetName));
  },
});

export const customWaitFor = (handler: () => void): Promise<void> =>
  waitFor(handler, { interval: 10 });

export async function renderAndAwaitQueryHook<T>(
  hook: () => CustomQuery<T>
): Promise<CustomQuery<T>> {
  const { result } = customRenderHook(hook);
  await customWaitFor(() => expect(result.current.isLoading).toBe(false));
  return result.current;
}
