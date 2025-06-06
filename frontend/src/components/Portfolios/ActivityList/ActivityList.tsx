import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import moment from "moment";
import { isOrder } from "pt-domain/src/activity/activity.derivers";
import { PortfolioActivity } from "pt-domain/src/activity/activity.entities";
import { getDividendVolume } from "pt-domain/src/dividendPayouts/dividend.derivers";
import { getOrderVolume } from "pt-domain/src/order/order.derivers";
import { ReactElement, useState } from "react";
import { useGetAssets } from "../../../hooks/assets/assetHooks";
import {
  useDeleteDividendPayoutFromPortfolio,
  useDeleteOrderFromPortfolio,
  useGetPortfolioActivity,
} from "../../../hooks/portfolios/portfolioHooks";
import { toPrice } from "../../../utility/prices";
import { Props } from "../../../utility/types";
import { Button } from "../../general/Button";
import CustomTable from "../../general/CustomTable/CustomTable";
import DeleteButtonWithConfirmation from "../../general/DeleteButtonWithConfirm/DeleteButtonWithConfirmation";
import { Headline } from "../../general/headline/Headline";
import styles from "./ActivityList.module.less";

type ActivityListProps = Props<{
  portfolio: string;
}>;

function ActivityList({ portfolio }: ActivityListProps): ReactElement | null {
  const [showAll, setShowAll] = useState(false);
  const activity = useGetPortfolioActivity(portfolio);
  const assetsLib = useGetAssets();
  const deleteOrder = useDeleteOrderFromPortfolio(portfolio);
  const deleteDividendPayout = useDeleteDividendPayoutFromPortfolio(portfolio);

  if (!activity || !assetsLib) {
    return null;
  }

  const tableData = showAll
    ? activity.reverse()
    : activity.reverse().slice(0, 10);
  const assets = assetsLib;

  const columnHelper = createColumnHelper<PortfolioActivity>();

  const defs: ColumnDef<PortfolioActivity, any>[] = [
    columnHelper.accessor((a) => a, {
      id: "type",
      header: "Type",
      cell: (activity) =>
        isOrder(activity.getValue()) ? (
          <i
            className={`fa fa-${activity.getValue().pieces > 0 ? "plus" : "minus"}`}
          />
        ) : (
          <i className={"fa fa-euro-sign"} />
        ),
      meta: {
        align: "center",
      },
    }),
    columnHelper.accessor((a) => a.timestamp, {
      header: "Date",
      cell: (props) => (
        <span>{moment(props.cell.getValue()).format("ll")}</span>
      ),
    }),
    columnHelper.accessor("asset", {
      header: "Asset",
      cell: (a) => assets[a.getValue()]?.displayName || "asset not found",
    }),
    columnHelper.accessor("pieces", {
      header: "Pieces",
      cell: (p) => p.getValue(),
      meta: {
        align: "right",
      },
    }),
    columnHelper.accessor((a) => a, {
      header: "Value per Share",
      cell: (props) => {
        const activity = props.getValue();
        return isOrder(activity)
          ? toPrice(activity.sharePrice)
          : toPrice(activity.dividendPerShare);
      },
      meta: {
        align: "right",
      },
    }),
    columnHelper.accessor((a) => a, {
      header: "Amount",
      cell: (props) => {
        const activity = props.getValue();
        return isOrder(activity)
          ? toPrice(getOrderVolume(activity))
          : toPrice(getDividendVolume(activity));
      },
      meta: {
        align: "right",
      },
    }),
    columnHelper.accessor((a) => a, {
      header: "Fees",
      cell: (a) => {
        const activity = a.getValue();
        return isOrder(activity) ? toPrice(activity.orderFee) : toPrice(0);
      },
      meta: {
        align: "right",
      },
    }),
    columnHelper.accessor("taxes", {
      header: "Taxes",
      cell: (props) => toPrice(props.getValue()),
      meta: {
        align: "right",
      },
    }),
    columnHelper.accessor((a) => a, {
      header: "Actions",
      cell: (props) => {
        const activity = props.getValue();
        return (
          <DeleteButtonWithConfirmation
            deleteHandler={() =>
              isOrder(activity)
                ? deleteOrder(activity)
                : deleteDividendPayout(activity)
            }
            title={"Delete Activity?"}
            body={`Are you sure you want to delete this activity?`}
          />
        );
      },
      meta: {
        align: "center",
      },
    }),
  ];

  return (
    <div>
      <Headline text={"Portfolio Activity"} className={styles.headline} />
      <CustomTable columns={defs} data={tableData} />
      <div className={styles.showAllButton}>
        <Button
          onClick={() => setShowAll(!showAll)}
          label={showAll ? "Show less" : "Show all"}
        />
      </div>
    </div>
  );
}

export default ActivityList;
