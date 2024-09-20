import { useGetPositionListItems } from "../ClosedPositionsList/PositionList.logic";
import { PositionsList } from "../PositionList";

type OpenPositionsListProps = { portfolioName: string };

export const OpenPositionsList = ({
  portfolioName,
}: OpenPositionsListProps) => {
  const positions = useGetPositionListItems(portfolioName, "open");

  return positions ? (
    <PositionsList
      portfolioName={portfolioName}
      batchType={"open"}
      items={positions}
      headline={"Open Positions"}
    />
  ) : null;
};
