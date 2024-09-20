import { PositionsList } from "../PositionList";
import { useGetPositionListItems } from "./PositionList.logic";

type OpenPositionsListProps = { portfolioName: string };

export const ClosedPositionsList = ({
  portfolioName,
}: OpenPositionsListProps) => {
  const closedPositions = useGetPositionListItems(portfolioName, "closed");

  return closedPositions ? (
    <PositionsList
      portfolioName={portfolioName}
      batchType={"closed"}
      items={closedPositions}
      headline={"Closed Positions"}
    />
  ) : null;
};
