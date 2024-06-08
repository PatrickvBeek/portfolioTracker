import { last, sort, sum } from "radash";
import {
  getActivityDate,
  getNumericDateTime,
  isOrder,
} from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import {
  getDividendVolume,
  sumDividendTaxes,
} from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import { Portfolio } from "../portfolio/portfolio.entities";
import {
  Batches,
  BatchesHistory,
  ClosedBatch,
  OpenBatch,
} from "./batch.entities";

const EMPTY_BATCHES: Batches = { open: [], closed: [] };

export const getPositionDividendSum = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Batches
): number =>
  sum(
    (getBatches(portfolio, isin)?.[positionType] || [])
      .flatMap((position) => position.dividendPayouts)
      .map(getDividendVolume)
  );

export const getTotalTaxesForClosedBatches = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getBatches(portfolio, isin)?.closed || [],
    ({ taxes, dividendPayouts }) => taxes + sumDividendTaxes(dividendPayouts)
  );

export function getBatches(
  portfolio: Portfolio,
  isin: string
): Batches | undefined {
  const orders = portfolio.orders[isin] || [];
  const dividends = portfolio.dividendPayouts[isin] || [];
  const activity = sort([...orders, ...dividends], getNumericDateTime);
  if (sum(orders, (order) => order.pieces) < 0) {
    return undefined; // you can't sell more pieces than you have (shorting is not supported).
  }

  return activity.reduce(updateBatchesWithActivity, EMPTY_BATCHES);
}

export function getBatchesHistory(orders: Order[]): BatchesHistory {
  const history = sort(orders, getNumericDateTime).reduce<BatchesHistory>(
    (history, order) => {
      const oldBatches = last(history)?.batches || EMPTY_BATCHES;
      const newBatches = updateBatchesWithOrder(oldBatches, order);
      if (!newBatches) {
        return history;
      }
      return [
        ...history,
        { date: getActivityDate(order), batches: newBatches },
      ];
    },
    [] as BatchesHistory
  );

  if (history.length !== orders.length) {
    return [];
  }

  return history;
}

export const getBatchesAtTimeStamp = (
  orders: Order[],
  timeStampOfInterest: number
): Batches =>
  getBatchesHistory(orders).findLast(
    ({ date }) => date.getTime() <= timeStampOfInterest
  )?.batches || EMPTY_BATCHES;

function updateBatchesWithActivity(
  batches: Batches | undefined,
  activity: PortfolioActivity
): Batches | undefined {
  if (!batches) {
    return undefined;
  }
  return isOrder(activity)
    ? updateBatchesWithOrder(batches, activity)
    : updateBatchesWithDividendPayout(batches, activity);
}

function updateBatchesWithDividendPayout(
  batches: Batches,
  payout: DividendPayout
): Batches {
  return {
    closed: batches.closed,
    open: batches.open.map((pos) => ({
      ...pos,
      dividendPayouts: sort(
        [...pos.dividendPayouts, { ...payout, pieces: pos.pieces }],
        getNumericDateTime
      ),
    })),
  };
}

function updateBatchesWithOrder(
  batches: Batches | undefined,
  order: Order
): Batches | undefined {
  if (!batches) {
    return undefined;
  }
  return order.pieces < 0
    ? updateBatchesWithSell(batches, order)
    : updateBatchesWithBuy(batches, order);
}

function updateBatchesWithSell(
  batches: Batches | undefined,
  sell: Order
): Batches | undefined {
  if (!batches || sell.pieces > 0 || batches.open.length < 1) {
    return undefined;
  }
  const piecesToSell = -sell.pieces;
  const [firstBatch, ...remaining] = batches.open;

  if (piecesToSell === firstBatch.pieces) {
    return closeFirstBatchCompletely(
      firstBatch,
      remaining,
      batches.closed,
      sell
    );
  }

  if (piecesToSell < firstBatch.pieces) {
    return closeFirstBatchPartially(
      firstBatch,
      remaining,
      batches.closed,
      sell,
      piecesToSell
    );
  }

  return closeFirstBatchAndContinue(
    firstBatch,
    remaining,
    batches.closed,
    sell,
    piecesToSell
  );
}

function closeFirstBatchCompletely(
  firstBatch: OpenBatch,
  remaining: OpenBatch[],
  closedBatches: ClosedBatch[],
  sell: Order
): Batches {
  const newBatch: ClosedBatch = {
    ...firstBatch,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee: firstBatch.orderFee + sell.orderFee,
    taxes: firstBatch.taxes + sell.taxes,
  };

  return {
    open: remaining,
    closed: [...closedBatches, newBatch],
  };
}

function closeFirstBatchPartially(
  firstBatch: OpenBatch,
  remaining: OpenBatch[],
  closedBatches: ClosedBatch[],
  sell: Order,
  piecesToSell: number
): Batches {
  const newlyClosed: ClosedBatch = {
    ...firstBatch,
    pieces: piecesToSell,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee:
      (piecesToSell / firstBatch.pieces) * firstBatch.orderFee + sell.orderFee,
    taxes: (piecesToSell / firstBatch.pieces) * firstBatch.taxes + sell.taxes,
    dividendPayouts: firstBatch.dividendPayouts.map((payout) => ({
      ...payout,
      pieces: piecesToSell,
    })),
  };
  const reducedBatch: OpenBatch = {
    ...firstBatch,
    pieces: firstBatch.pieces - piecesToSell,
    orderFee: (1 - piecesToSell / firstBatch.pieces) * firstBatch.orderFee,
    taxes: (1 - piecesToSell / firstBatch.pieces) * firstBatch.taxes,
    dividendPayouts: firstBatch.dividendPayouts.map((payout) => ({
      ...payout,
      pieces: firstBatch.pieces - piecesToSell,
    })),
  };

  return {
    open: [reducedBatch, ...remaining],
    closed: [...closedBatches, newlyClosed],
  };
}

function closeFirstBatchAndContinue(
  firstBatch: OpenBatch,
  remainingOpen: OpenBatch[],
  closedBatch: ClosedBatch[],
  sell: Order,
  piecesToSell: number
): Batches | undefined {
  const newBatch: ClosedBatch = {
    ...firstBatch,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee:
      firstBatch.orderFee + (firstBatch.pieces / piecesToSell) * sell.orderFee,
    taxes: firstBatch.taxes + (firstBatch.pieces / piecesToSell) * sell.taxes,
  };
  const piecesStillToSell = piecesToSell - firstBatch.pieces;

  return updateBatchesWithSell(
    { open: remainingOpen, closed: [...closedBatch, newBatch] },
    {
      ...sell,
      pieces: -piecesStillToSell,
      orderFee: (1 - firstBatch.pieces / piecesToSell) * sell.orderFee,
      taxes: (1 - firstBatch.taxes / piecesToSell) * sell.taxes,
    }
  );
}

const orderToOpenBatch = (order: Order): OpenBatch => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
  taxes: order.taxes,
  dividendPayouts: [],
});

export const getBatchInitialValue = (batch: OpenBatch): number =>
  batch.pieces * batch.buyPrice;

function updateBatchesWithBuy(batch: Batches, buy: Order): Batches | undefined {
  if (buy.pieces < 0) {
    return undefined;
  }

  return {
    closed: batch.closed,
    open: [...batch.open, orderToOpenBatch(buy)],
  };
}
