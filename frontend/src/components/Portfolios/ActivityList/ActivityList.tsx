import { Trash2 } from "lucide-react";
import moment from "moment";
import { canDeleteActivity, isOrder, PortfolioActivity } from "pt-domain";
import { useState } from "react";
import {
  useDeleteDividendPayoutFromPortfolio,
  useDeleteOrderFromPortfolio,
} from "../../../hooks/portfolios/portfolioHooks";
import { cn } from "../../../utility/cn";
import { toPrice } from "../../../utility/prices";
import { Button } from "../../ui/Button";
import { ConfirmationDialog } from "../../ui/ConfirmationDialog";
import { Dialog } from "../../ui/Dialog";
import { Heading } from "../../ui/Heading";
import {
  ActivityRowData,
  toActivityRowData,
  useActivityListData,
} from "./ActivityList.logic";
import { nodeVariants, styles } from "./ActivityList.styles";

type ActivityListProps = {
  portfolio: string;
};

function DesktopActivityRow({
  rowData,
  isLast,
  onDelete,
}: {
  rowData: ActivityRowData;
  isLast: boolean;
  onDelete: () => void;
}) {
  const {
    activity,
    activityType,
    label,
    icon: Icon,
    assetName,
    amount,
    pricePerShare,
    fees,
    taxes,
  } = rowData;

  return (
    <div className={cn(styles.item, !isLast && "mb-3")}>
      <div className={styles.rail}>
        <div
          className={cn(nodeVariants({ type: activityType }))}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className={styles.connector} />}
      </div>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <span className={styles.dateCell}>
            {moment(activity.timestamp).format("ll")}
          </span>
          <span className={styles.assetCell}>{assetName}</span>
          {isOrder(activity) && (
            <span className={styles.piecesCell}>{activity.pieces} pcs</span>
          )}
          <span className={styles.amountCell}>{amount}</span>
          <span className={styles.priceCell}>@ {pricePerShare}/sh</span>
          <span className={styles.feeCell}>Fees: {fees}</span>
          <span className={styles.taxCell}>Tax: {taxes}</span>
          <div className={styles.actionCell}>
            <Button
              intent="danger-ghost"
              onClick={onDelete}
              aria-label={`Delete ${label} of ${assetName}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileActivityRow({
  rowData,
  isLast,
  onDelete,
}: {
  rowData: ActivityRowData;
  isLast: boolean;
  onDelete: () => void;
}) {
  const {
    activity,
    activityType,
    label,
    icon: Icon,
    assetName,
    amount,
    pricePerShare,
    fees,
    taxes,
  } = rowData;

  return (
    <div className={cn(styles.item, !isLast && "mb-3")}>
      <div className={styles.rail}>
        <div
          className={cn(nodeVariants({ type: activityType }))}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className={styles.connector} />}
      </div>
      <div className={styles.mobileCard}>
        <div className={styles.mobileCardInner}>
          <div className={styles.mobileHeader}>
            <span className={styles.mobileAssetName}>{assetName}</span>
            <span className={styles.mobileDate}>
              {moment(activity.timestamp).format("ll")}
            </span>
          </div>
          <div className={styles.mobileDetails}>
            <div className={styles.mobileDetailItem}>
              <span className={styles.mobileDetailValue}>
                {isOrder(activity)
                  ? `${activity.pieces} pcs`
                  : `${toPrice(activity.dividendPerShare)}/sh`}
              </span>{" "}
              {isOrder(activity) && `@ ${pricePerShare}/sh`}
            </div>
          </div>
          <div className={styles.mobileSecondaryDetails}>
            <span>Fees: {fees}</span>
            <span>Tax: {taxes}</span>
          </div>
          <div className={styles.mobileAmountSection}>
            <span className={styles.mobileAmount}>{amount}</span>
            <Button
              intent="danger-ghost"
              onClick={onDelete}
              aria-label={`Delete ${label} of ${assetName}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityList({ portfolio }: ActivityListProps) {
  const [showAll, setShowAll] = useState(false);
  const [showInvalidDeletionDialog, setShowInvalidDeletionDialog] =
    useState(false);
  const [activityToDelete, setActivityToDelete] =
    useState<PortfolioActivity | null>(null);
  const { activity, portfolioData, assetsLib } = useActivityListData(portfolio);
  const deleteOrder = useDeleteOrderFromPortfolio(portfolio);
  const deleteDividendPayout = useDeleteDividendPayoutFromPortfolio(portfolio);

  if (!activity || !assetsLib || !portfolioData) {
    return null;
  }

  if (activity.length === 0) {
    return (
      <div className={styles.container}>
        <Heading level="h1">Portfolio Activity</Heading>
        <div className={styles.emptyState}>
          <p className={styles.emptyStatePrimary}>No activity yet.</p>
          <p className={styles.emptyStateSecondary}>
            Add orders or dividend payouts to see them here.
          </p>
        </div>
      </div>
    );
  }

  const handleDeleteActivity = (a: PortfolioActivity) => {
    if (!canDeleteActivity(portfolioData, a)) {
      setShowInvalidDeletionDialog(true);
      return;
    }
    if (isOrder(a)) {
      deleteOrder(a);
    } else {
      deleteDividendPayout(a);
    }
  };

  const tableData = showAll
    ? activity.toReversed()
    : activity.toReversed().slice(0, 10);
  const assets = assetsLib;

  const rowDataMap = new Map(
    tableData.map((a) => [a.uuid, toActivityRowData(a, assets)])
  );

  return (
    <div className={styles.container}>
      <Heading level="h1">Portfolio Activity</Heading>

      <div className={styles.timeline}>
        {tableData.map((a, i) => (
          <div
            key={a.uuid}
            className="md:block hidden"
            data-testid="desktop-row"
          >
            <DesktopActivityRow
              rowData={rowDataMap.get(a.uuid)!}
              isLast={i === tableData.length - 1}
              onDelete={() => setActivityToDelete(a)}
            />
          </div>
        ))}

        {tableData.map((a, i) => (
          <div
            key={`mobile-${a.uuid}`}
            className="md:hidden"
            data-testid="mobile-row"
          >
            <MobileActivityRow
              rowData={rowDataMap.get(a.uuid)!}
              isLast={i === tableData.length - 1}
              onDelete={() => setActivityToDelete(a)}
            />
          </div>
        ))}
      </div>

      {activity.length > 10 && (
        <div className={styles.showAllButton}>
          <Button intent="ghost" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show less" : "Show all"}
          </Button>
        </div>
      )}

      {activityToDelete && (
        <ConfirmationDialog
          open={!!activityToDelete}
          onCancel={() => setActivityToDelete(null)}
          onConfirm={() => {
            handleDeleteActivity(activityToDelete);
            setActivityToDelete(null);
          }}
          title="Delete Activity?"
          body="Are you sure you want to delete this activity?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmIntent="danger"
        />
      )}

      <Dialog
        open={showInvalidDeletionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowInvalidDeletionDialog(false);
          }
        }}
        title="Cannot Delete Transaction"
      >
        <p className={styles.infoDialogBody}>
          This transaction cannot be deleted because it would cause a situation,
          where at least one transaction attempts to sell more pieces than
          available at this point in time.
        </p>
        <div className={styles.infoDialogActions}>
          <Button
            intent="primary"
            onClick={() => setShowInvalidDeletionDialog(false)}
          >
            OK
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
