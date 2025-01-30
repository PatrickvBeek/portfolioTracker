import { last, sort, sum } from "radash";
import { getNumericDateTime, isOrder } from "../activity/activity.derivers";
import { PortfolioActivity } from "../activity/activity.entities";
import { sumDividendTaxes } from "../dividendPayouts/dividend.derivers";
import { DividendPayout } from "../dividendPayouts/dividend.entities";
import { Order } from "../order/order.entities";
import { History } from "../portfolioHistory/history.entities";
import {
  areFloatsEqual,
  isFloatLowerThan,
  isFloatNegative,
} from "../utils/floats";
import { BatchType, Batches, ClosedBatch, OpenBatch } from "./batch.entities";

const EMPTY_BATCHES: Batches = { open: [], closed: [] };

export const getTotalTaxesForClosedBatches = (
  orders: Order[],
  dividendPayouts: DividendPayout[]
): number =>
  sum(
    getBatchesOfType(orders, dividendPayouts, "closed"),
    ({ taxes, dividendPayouts }) => taxes + sumDividendTaxes(dividendPayouts)
  );

export function getBatches(
  orders: Order[],
  dividendPayouts: DividendPayout[]
): Batches | undefined {
  const activity = sort([...orders, ...dividendPayouts], getNumericDateTime);
  if (isFloatNegative(sum(orders, (order) => order.pieces))) {
    return undefined; // you can't sell more pieces than you have (shorting is not supported).
  }

  return activity.reduce(updateBatchesWithActivity, EMPTY_BATCHES);
}

export function getBatchesOfType<T extends BatchType>(
  orders: Order[],
  dividendPayouts: DividendPayout[],
  batchType: T
): Batches[T] {
  return getBatches(orders, dividendPayouts)?.[batchType] || [];
}

export function getBatchesHistory(orders: Order[]): History<Batches> {
  const history = sort(orders, getNumericDateTime).reduce<History<Batches>>(
    (history, order) => {
      const oldBatches = last(history)?.value || EMPTY_BATCHES;
      const newBatches = updateBatchesWithOrder(oldBatches, order);
      if (!newBatches) {
        return history;
      }
      return [
        ...history,
        { timestamp: getNumericDateTime(order), value: newBatches },
      ];
    },
    [] as History<Batches>
  );

  if (history.length !== orders.length) {
    return [];
  }

  return history;
}

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
        [
          ...pos.dividendPayouts,
          {
            ...payout,
            pieces: pos.pieces,
            taxes: payout.taxes * (pos.pieces / payout.pieces),
          },
        ],
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

  if (areFloatsEqual(piecesToSell, firstBatch.pieces)) {
    return closeFirstBatchCompletely(
      firstBatch,
      remaining,
      batches.closed,
      sell
    );
  }

  if (isFloatLowerThan(piecesToSell, firstBatch.pieces)) {
    return closeFirstBatchPartially(
      firstBatch,
      remaining,
      batches.closed,
      sell,
      piecesToSell
    );
  }

  const newlyClosedBatch = {
    ...firstBatch,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee:
      firstBatch.orderFee + (firstBatch.pieces / piecesToSell) * sell.orderFee,
    taxes: firstBatch.taxes + (firstBatch.pieces / piecesToSell) * sell.taxes,
  };

  const piecesStillToSell = piecesToSell - firstBatch.pieces;

  return updateBatchesWithSell(
    { open: remaining, closed: [...batches.closed, newlyClosedBatch] },
    {
      ...sell,
      pieces: -piecesStillToSell,
      orderFee: (1 - firstBatch.pieces / piecesToSell) * sell.orderFee,
      taxes: (1 - firstBatch.pieces / piecesToSell) * sell.taxes,
    }
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
  const newlyClosed = {
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
      taxes: (piecesToSell / payout.pieces) * payout.taxes,
    })),
  };

  const reducedBatch = {
    ...firstBatch,
    pieces: firstBatch.pieces - piecesToSell,
    orderFee: (1 - piecesToSell / firstBatch.pieces) * firstBatch.orderFee,
    taxes: (1 - piecesToSell / firstBatch.pieces) * firstBatch.taxes,
    dividendPayouts: firstBatch.dividendPayouts.map((payout) => ({
      ...payout,
      pieces: firstBatch.pieces - piecesToSell,
      taxes: (1 - piecesToSell / payout.pieces) * payout.taxes,
    })),
  };

  return {
    open: [reducedBatch, ...remaining],
    closed: [...closedBatches, newlyClosed],
  };
}

const orderToOpenBatch = (order: Order): OpenBatch => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
  taxes: order.taxes,
  dividendPayouts: [],
});

export const getBuyValue = (batch: OpenBatch): number =>
  batch.pieces * batch.buyPrice;

function updateBatchesWithBuy(batch: Batches, buy: Order): Batches | undefined {
  return {
    closed: batch.closed,
    open: [...batch.open, orderToOpenBatch(buy)],
  };
}
export const getProfitForClosedBatch = ({
  pieces,
  buyPrice,
  sellPrice,
  orderFee,
  taxes,
}: ClosedBatch): number => pieces * (sellPrice - buyPrice) - orderFee - taxes;

export const getProfitForOpenBatch = (
  { pieces, buyPrice, orderFee, taxes }: OpenBatch,
  currentPrice: number
): number => pieces * (currentPrice - buyPrice) - orderFee - taxes;
