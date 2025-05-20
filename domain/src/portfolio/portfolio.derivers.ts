import { last, mapValues, min, partial, sort, sum } from "radash";
import {
  getActivityCashFlow,
  getCashFlowHistoryForActivities,
  getNumericDateTime,
} from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  getBatches,
  getBatchesHistory,
  getBatchesOfType,
  getBuyValue,
  getProfitForClosedBatch,
  getProfitForOpenBatch,
} from "../batch/batch.derivers";
import { BatchType, Batches } from "../batch/batch.entities";
import { getDividendNetVolume } from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { areOrdersEqualOnDay } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import {
  differentiateNumberHistory,
  getHistoryMapper,
  getPiecesAtTimeStamp,
  mergePointsAtSameTimestamp,
  pickValueFromHistory,
} from "../portfolioHistory/history.derivers";
import { History } from "../portfolioHistory/history.entities";
import { updateBy } from "../utils/arrays";
import { isFloatPositive } from "../utils/floats";
import { Portfolio } from "./portfolio.entities";

type PriceMap = Record<string, History<number>>;

export const EMPTY_PORTFOLIO = {
  name: "",
  orders: {},
  dividendPayouts: {},
};

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

export const getTotalCashFlowHistory = (portfolio: Portfolio) =>
  getCashFlowHistoryForActivities(
    sort(getActivitiesForPortfolio(portfolio), (o) => getNumericDateTime(o))
  );

const getCashFlowsMergedAtSameTimestamp = (
  portfolio: Portfolio
): History<number> => {
  const flows = getActivitiesForPortfolio(portfolio).map((a) => ({
    value: getActivityCashFlow(a),
    timestamp: getNumericDateTime(a),
  }));

  return mergePointsAtSameTimestamp(flows);
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

/**
 * First, try to find the price of an asset by an exact match in the transactions.
 * If there is no transaction at this date, use online prices. If they are none available,
 * use the latest known price from the transactions.
 */
export const getPriceAtTimestamp = (
  portfolio: Portfolio,
  isin: string,
  t: number,
  priceMap: Record<string, History<number>>
): number =>
  getOrdersForIsin(portfolio, isin).find((o) => getNumericDateTime(o) === t)
    ?.sharePrice ??
  pickValueFromHistory(priceMap[isin], t, "descending")?.value ??
  getOrdersForIsin(portfolio, isin).findLast((o) => getNumericDateTime(o) <= t)
    ?.sharePrice ??
  returnNaNAndLogWarning(isin, t);

const returnNaNAndLogWarning = (isin: string, t: number): number => {
  console.log(
    `Could not find any price for ${isin} at ${t}. Neither in transactions nor in online price map.`
  );
  return NaN;
};

export const getTimeWeightedReturn = (
  portfolio: Portfolio,
  priceMap: PriceMap
): number | undefined =>
  last(getTimeWeightedReturnHistory(portfolio, priceMap))?.value;

export const getTimeWeightedReturnHistory = (
  portfolio: Portfolio,
  priceMap: PriceMap,
  baseAxis: number[] = [Date.now()]
): History<number> => {
  const cashFlows = getCashFlowsMergedAtSameTimestamp(portfolio);
  if (!cashFlows.length) {
    return [];
  }

  /**
   * extend the actual cash flows with '0' cash flows.
   * This allows to evaluate the TWR also between cash flows.
   * */
  const points = sort(
    cashFlows.concat(baseAxis.map((t) => ({ timestamp: t, value: 0 }))),
    (p) => p.timestamp
  );

  const valueHistory = getMarketValueHistory(
    portfolio,
    priceMap,
    points.map((c) => c.timestamp)
  );

  const [fistFlow, ...restFlows] = points;

  const twr = [{ timestamp: fistFlow.timestamp, value: 1 }];
  let previousValue = valueHistory[0].value;

  for (const flow of restFlows) {
    const currentTimestamp = flow.timestamp;
    const currentCashFlow = flow.value;

    const currentValue =
      pickValueFromHistory(valueHistory, currentTimestamp)?.value || 0;
    const currentReturn = (currentValue - currentCashFlow) / previousValue;

    twr.push({
      timestamp: flow.timestamp,
      value: twr[twr.length - 1].value * currentReturn,
    });
    previousValue = currentValue;
  }

  return twr;
};

export const getBuyValueHistoryForPortfolio = (
  portfolio: Portfolio
): History<number> => {
  const diffs = Object.values(portfolio.orders)
    .map(getBatchesHistory)
    .map(getHistoryMapper((batch) => sum(batch.open, getBuyValue)))
    .map(differentiateNumberHistory)
    .flat();

  return updateBy(
    sort(diffs, (diff) => diff.timestamp),
    (prev, current) => ({
      timestamp: current.timestamp,
      value: prev.value + current.value,
    })
  );
};

export const getProfitHistory = (
  portfolio: Portfolio,
  priceMap: PriceMap,
  xAxis: number[]
): History<number> => {
  const marketValueHistory = getMarketValueHistory(portfolio, priceMap, xAxis);
  const cashFlowHistory = getTotalCashFlowHistory(portfolio);

  return marketValueHistory.map((marketValuePoint) => {
    const latestCashFlow =
      pickValueFromHistory(cashFlowHistory, marketValuePoint.timestamp)
        ?.value || 0;

    return {
      timestamp: marketValuePoint.timestamp,
      value: marketValuePoint.value - latestCashFlow,
    };
  });
};
