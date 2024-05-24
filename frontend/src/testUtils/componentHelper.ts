import { act, screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

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
