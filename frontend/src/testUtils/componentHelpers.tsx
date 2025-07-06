import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent, { Options, UserEvent } from "@testing-library/user-event";
import { ReactElement } from "react";
import { CustomQuery } from "../hooks/prices/priceHooks";
import { queryClientConfig } from "../queryClient/config";
import { UserDataProvider } from "../userDataContext";

// Create a test theme that disables ripple effects to prevent act() warnings
const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export function customRenderHook<T>(hookCallback: () => T) {
  const queryClient = new QueryClient(queryClientConfig);
  return renderHook(hookCallback, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={testTheme}>
        <UserDataProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </UserDataProvider>
      </ThemeProvider>
    ),
  });
}

export function customRender({
  component,
  userEventOptions,
}: {
  component: ReactElement;
  userEventOptions?: Options;
}) {
  const queryClient = new QueryClient(queryClientConfig);
  const user = userEvent.setup(userEventOptions);
  const renderResult = render(
    <ThemeProvider theme={testTheme}>
      <UserDataProvider>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </UserDataProvider>
    </ThemeProvider>
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

export const getTextWithNonBreakingSpaceReplaced = (element: HTMLElement) =>
  element.textContent?.replace(/\u00A0/g, " ");

export const customWaitFor = (handler: () => void): Promise<void> =>
  waitFor(handler, { interval: 10 });

export async function renderAndAwaitQueryHook<T>(
  hook: () => CustomQuery<T>
): Promise<CustomQuery<T>> {
  const { result } = customRenderHook(hook);
  await customWaitFor(() => expect(result.current.isLoading).toBe(false));
  return result.current;
}
