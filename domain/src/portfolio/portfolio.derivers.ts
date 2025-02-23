import { group, mapValues, min, partial, sort, sum } from "radash";
import {
  getActivityCashFlow,
  getNumericDateTime,
} from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  getBatches,
  getBatchesHistory,
  getBatchesOfType,
  getProfitForClosedBatch,
  getProfitForOpenBatch,
} from "../batch/batch.derivers";
import { BatchType, Batches } from "../batch/batch.entities";
import { getDividendNetVolume } from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { areOrdersEqualOnDay } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import {
  getCashFlowHistoryForActivities,
  getPiecesAtTimeStamp,
  pickValueFromHistory,
} from "../portfolioHistory/history.derivers";
import { History } from "../portfolioHistory/history.entities";
import { isFloatPositive } from "../utils/floats";
import { Portfolio } from "./portfolio.entities";

const getOrdersForIsin = (portfolio: Portfolio, isin: string): Order[] =>
  portfolio.orders[isin] || [];

export const getIsins = (portfolio: Portfolio) => Object.keys(portfolio.orders);

const getDividendPayoutsForIsin = (
  portfolio: Portfolio,
  isin: string
): DividendPayout[] => portfolio.dividendPayouts[isin] || [];

export const getPortfolioBatchesOfType = <T extends BatchType>(
  portfolio: Portfolio,
  isin: string,
  batchType: T
): Batches[T] =>
  getBatchesOfType(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin),
    batchType
  );

export const getBatchesForIsin = (
  portfolio: Portfolio,
  isin: string
): Batches | undefined =>
  getBatches(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin)
  );

const getAllOrdersInPortfolio = (portfolio: Portfolio): Order[] =>
  Object.values(portfolio.orders).flat();

export const getAssetsForBatchType = (
  portfolio: Portfolio,
  batchType: BatchType
): string[] =>
  getIsins(portfolio).filter(partial(isIsinOfBatchType, portfolio, batchType));

const isIsinOfBatchType = (
  portfolio: Portfolio,
  batchType: BatchType,
  isin: string
): boolean => {
  const isOpen = isFloatPositive(
    getPiecesOfIsinInPortfolio(portfolio, isin, "open")
  );

  return batchType === "open" ? isOpen : !isOpen;
};

const getAllDividendPayoutsInPortfolio = (
  portfolio: Portfolio
): DividendPayout[] => Object.values(portfolio.dividendPayouts).flat();

export const getActivitiesForPortfolio = (
  portfolio: Portfolio
): PortfolioActivity[] =>
  sort(
    [
      ...getAllOrdersInPortfolio(portfolio),
      ...getAllDividendPayoutsInPortfolio(portfolio),
    ],
    getNumericDateTime
  );

export const getPiecesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType = "open"
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, batchType),
    (pos) => pos.pieces
  );

export const getOrderFeesOfIsinInPortfolio = (
  portfolio: Portfolio,
  isin: string,
  batchType: BatchType | "both"
): number => {
  const batches = getBatches(
    getOrdersForIsin(portfolio, isin),
    getDividendPayoutsForIsin(portfolio, isin)
  );
  if (!batches) {
    return 0;
  }
  const fees = {
    ...batches,
    both: batches.open.concat(batches.closed),
  };

  return sum(fees[batchType], (pos) => pos.orderFee);
};

export const getSoldValueOfClosedBatches = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, "closed"),
    (p) => p.sellPrice * p.pieces
  );

export const getRealizedGains = (portfolio: Portfolio): number =>
  sum(
    getIsins(portfolio).map((isin) => getRealizedGainsForIsin(portfolio, isin))
  );

export const getRealizedGainsForIsin = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getPortfolioBatchesOfType(portfolio, isin, "closed"),
    getProfitForClosedBatch
  ) + getDividendSum(portfolio, isin);

export const getNonRealizedGains = (portfolio: Portfolio, priceMap: PriceMap) =>
  sum(
    getIsins(portfolio).map((isin) =>
      getNonRealizedGainsForIsin(
        portfolio,
        isin,
        getPriceAtTimestamp(portfolio, isin, Date.now(), priceMap) ?? NaN
      )
    )
  );

export const getNonRealizedGainsForIsin = (
  portfolio: Portfolio,
  isin: string,
  currentPrice: number
): number =>
  sum(getPortfolioBatchesOfType(portfolio, isin, "open"), (batch) =>
    getProfitForOpenBatch(batch, currentPrice)
  );

export const portfolioContainsOrder = (
  portfolio: Portfolio,
  order: Order
): boolean => {
  return getOrdersForIsin(portfolio, order.asset).some((o) =>
    areOrdersEqualOnDay(o, order)
  );
};

const getAvailablePiecesAtTimestamp = (
  portfolio: Portfolio,
  isin: string,
  timestamp: number
): number =>
  getPiecesAtTimeStamp(
    getBatchesHistory(getOrdersForIsin(portfolio, isin)),
    timestamp
  );

export const isOrderValidForPortfolio = (
  portfolio: Portfolio,
  order: Order
): boolean =>
  getAvailablePiecesAtTimestamp(
    portfolio,
    order.asset,
    getNumericDateTime(order)
  ) >= -order.pieces;

export const getDividendSum = (portfolio: Portfolio, isin: string): number =>
  sum(getDividendPayoutsForIsin(portfolio, isin).map(getDividendNetVolume));

export const getLatestPriceFromTransactions = (
  portfolio: Portfolio,
  isin: string
): number | undefined =>
  sort(getOrdersForIsin(portfolio, isin), getNumericDateTime).findLast(
    (a) => a.sharePrice
  )?.sharePrice;

export const getCurrentValueOfOpenBatches = (
  portfolio: Portfolio,
  isin: string,
  currentPrice: number
): number => getPiecesOfIsinInPortfolio(portfolio, isin) * currentPrice;

export const getCashFlowHistory = (portfolio: Portfolio) =>
  getCashFlowHistoryForActivities(
    sort(getActivitiesForPortfolio(portfolio), (o) => getNumericDateTime(o))
  );

const getCashFlowsMergedOnSameDay = (portfolio: Portfolio): History<number> => {
  const flows = getActivitiesForPortfolio(portfolio).map((a) => ({
    value: getActivityCashFlow(a),
    timestamp: getNumericDateTime(a),
  }));

  return Object.entries(group(flows, (flows) => flows.timestamp)).map(
    ([timestamp, flowValues]) => ({
      timestamp: parseInt(timestamp),
      value: sum(flowValues || [], (flowValues) => flowValues.value),
    })
  );
};

export const getFirstOrderTimeStamp = (portfolio: Portfolio) =>
  min(getAllOrdersInPortfolio(portfolio).map(getNumericDateTime));

export const getMarketValueHistory = (
  portfolio: Portfolio,
  priceMap: PriceMap,
  xAxis: number[]
): History<number> => {
  const batchesHistories = mapValues(portfolio.orders, getBatchesHistory);

  return xAxis.map((t) => ({
    timestamp: t,
    value: sum(
      Object.entries(batchesHistories).map(([isin, batchesHistory]) => {
        const pieces = getPiecesAtTimeStamp(batchesHistory, t);

        return pieces
          ? pieces * getPriceAtTimestamp(portfolio, isin, t, priceMap)
          : 0;
      })
    ),
  }));
};

export const getPriceAtTimestamp = (
  portfolio: Portfolio,
  isin: string,
  t: number,
  priceMap: Record<string, History<number>>
): number =>
  pickValueFromHistory(priceMap[isin], t, "descending")?.value ||
  getOrdersForIsin(portfolio, isin).findLast((o) => getNumericDateTime(o) <= t)
    ?.sharePrice ||
  returnNullAndLogWarning(isin, t);

const returnNullAndLogWarning = (isin: string, t: number): number => {
  console.log(
    `Could not find any price for ${isin} at ${t}. Neither in transactions nor in online price map.`
  );
  return 0;
};

export const getTimeWeightedReturn = (
  portfolio: Portfolio,
  priceMap: PriceMap
): number => {
  const cashFlows = getCashFlowsMergedOnSameDay(portfolio);
  if (!cashFlows.length) {
    return NaN;
  }

  const TODAY = Date.now();

  const xAxis = cashFlows.map((c) => c.timestamp).concat(TODAY);
  const valueHistory = getMarketValueHistory(portfolio, priceMap, xAxis);

  const [_, ...restFlows] = cashFlows;

  let twr = 1;
  let previousValue = valueHistory[0].value;

  for (const flow of restFlows) {
    const currentTimestamp = flow.timestamp;
    const currentCashFlow = flow.value;

    const currentValue =
      pickValueFromHistory(valueHistory, currentTimestamp)?.value || 0;
    const currentReturn = (currentValue - currentCashFlow) / previousValue;

    twr *= currentReturn;
    previousValue = currentValue;
  }

  const todaysValue = pickValueFromHistory(valueHistory, TODAY)?.value;

  return todaysValue ? twr * (todaysValue / previousValue) : twr;
};

type PriceMap = Record<string, History<number>>;
