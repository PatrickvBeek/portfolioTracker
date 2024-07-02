import { act, render, screen } from "@testing-library/react";
import userEvent, { Options, UserEvent } from "@testing-library/user-event";
import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { queryClientConfig } from "../queryClient/config";

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
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
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
    await act(async () => {
      await user.type(await screen.findByLabelText(label), value);
    });
  },
  selectAsset: async (assetName: string) => {
    const assetInput = await screen.findByLabelText("Asset");
    await act(async () => {
      await user.click(assetInput);
    });
    await act(async () => {
      await user.click(await screen.findByText(assetName));
    });
  },
});
