import { screen, within } from "@testing-library/dom";
import { getTextWithNonBreakingSpaceReplaced } from "../../../testUtils/componentHelpers";

export async function getCellTextsForRow(
  i: number
): Promise<(string | undefined)[]> {
  const row = (await screen.findAllByRole("row"))[i];
  const cells = await within(row).findAllByRole("cell");
  return cells.map((cell) => getTextWithNonBreakingSpaceReplaced(cell));
}
