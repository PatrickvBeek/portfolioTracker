import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent, { Options, UserEvent } from "@testing-library/user-event";
import { ReactElement } from "react";
import { queryClientConfig } from "../queryClient/config";
import { UserDataProvider } from "../userDataContext";

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

export const getTextWithNonBreakingSpaceReplaced = (element: HTMLElement) =>
  element.textContent?.replace(/\u00A0/g, " ");
