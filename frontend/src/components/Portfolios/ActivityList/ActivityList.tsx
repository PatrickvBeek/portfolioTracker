import { Trash2 } from "lucide-react";
import moment from "moment";
import { canDeleteActivity, isOrder, PortfolioActivity } from "pt-domain";
import { useState } from "react";
import {
  useDeleteDividendPayoutFromPortfolio,
  useDeleteOrderFromPortfolio,
} from "../../../userDataContext";
import { cn } from "../../../utility/cn";
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

function ActivityRow({
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
          <div className={styles.header}>
            <span className={styles.assetCell}>{assetName}</span>
            <span className={styles.dateCell}>
              {moment(activity.timestamp).format("ll")}
            </span>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Pieces</div>
              <div className={styles.metricValue}>{activity.pieces} pcs</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>
                {isOrder(activity) ? "Price/share" : "Div/share"}
              </div>
              <div className={styles.metricValue}>{pricePerShare}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Fees</div>
              <div className={styles.metricValue}>{fees}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Tax</div>
              <div className={styles.metricValue}>{taxes}</div>
            </div>
            <div className={styles.metricBlock}>
              <div className={styles.metricLabel}>Total</div>
              <div className={cn(styles.metricValue, "font-semibold")}>
                {amount}
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
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
        <div className={styles.sectionBody}>
          <Heading level="section">Portfolio Activity</Heading>
          <div className={styles.emptyState}>
            <p className={styles.emptyStatePrimary}>No activity yet.</p>
            <p className={styles.emptyStateSecondary}>
              Add orders or dividend payouts to see them here.
            </p>
          </div>
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
      <div className={styles.sectionBody}>
        <Heading level="section">Portfolio Activity</Heading>

        <div className={styles.timeline}>
          {tableData.map((a, i) => (
            <ActivityRow
              key={a.uuid}
              rowData={rowDataMap.get(a.uuid)!}
              isLast={i === tableData.length - 1}
              onDelete={() => setActivityToDelete(a)}
            />
          ))}
        </div>

        {activity.length > 10 && (
          <div className={styles.showAllButton}>
            <Button intent="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show less" : "Show all"}
            </Button>
          </div>
        )}
      </div>

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
