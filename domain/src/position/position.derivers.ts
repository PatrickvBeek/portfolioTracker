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
  ClosedPosition,
  OpenPosition,
  PositionHistory,
  Positions,
} from "./position.entities";

const EMPTY_POSITIONS: Positions = { open: [], closed: [] };

export const getPositionsDividendSum = (
  portfolio: Portfolio,
  isin: string,
  positionType: keyof Positions
): number =>
  sum(
    (getPositions(portfolio, isin)?.[positionType] || [])
      .flatMap((position) => position.dividendPayouts)
      .map(getDividendVolume)
  );

export const getTotalTaxesForClosedPosition = (
  portfolio: Portfolio,
  isin: string
): number =>
  sum(
    getPositions(portfolio, isin)?.closed || [],
    ({ taxes, dividendPayouts }) => taxes + sumDividendTaxes(dividendPayouts)
  );

export function getPositions(
  portfolio: Portfolio,
  isin: string
): Positions | undefined {
  const orders = portfolio.orders[isin] || [];
  const dividends = portfolio.dividendPayouts[isin] || [];
  const activity = sort([...orders, ...dividends], getNumericDateTime);
  if (sum(orders, (order) => order.pieces) < 0) {
    return undefined; // you can't sell more pieces than you have (shorting is not supported).
  }

  return activity.reduce(updatePositionsWithActivity, EMPTY_POSITIONS);
}

export function getPositionHistory(orders: Order[]): PositionHistory {
  const history = sort(orders, getNumericDateTime).reduce<PositionHistory>(
    (history, order) => {
      const oldPositions = last(history)?.positions || EMPTY_POSITIONS;
      const newPositions = updatePositionsWithOrder(oldPositions, order);
      if (!newPositions) {
        return history;
      }
      return [
        ...history,
        { date: getActivityDate(order), positions: newPositions },
      ];
    },
    [] as PositionHistory
  );

  if (history.length !== orders.length) {
    return [];
  }

  return history;
}

export const getPositionsAtTimeStamp = (
  orders: Order[],
  timeStampOfInterest: number
): Positions =>
  getPositionHistory(orders).findLast(
    ({ date }) => date.getTime() <= timeStampOfInterest
  )?.positions || EMPTY_POSITIONS;

function updatePositionsWithActivity(
  positions: Positions | undefined,
  activity: PortfolioActivity
): Positions | undefined {
  if (!positions) {
    return undefined;
  }
  return isOrder(activity)
    ? updatePositionsWithOrder(positions, activity)
    : updatePositionsWithDividendPayout(positions, activity);
}

function updatePositionsWithDividendPayout(
  positions: Positions,
  payout: DividendPayout
): Positions {
  return {
    closed: positions.closed,
    open: positions.open.map((pos) => ({
      ...pos,
      dividendPayouts: sort(
        [...pos.dividendPayouts, { ...payout, pieces: pos.pieces }],
        getNumericDateTime
      ),
    })),
  };
}

function updatePositionsWithOrder(
  positions: Positions | undefined,
  order: Order
): Positions | undefined {
  if (!positions) {
    return undefined;
  }
  return order.pieces < 0
    ? updatePositionsWithSell(positions, order)
    : updatePositionsWithBuy(positions, order);
}

function updatePositionsWithSell(
  positions: Positions | undefined,
  sell: Order
): Positions | undefined {
  if (!positions || sell.pieces > 0 || positions.open.length < 1) {
    return undefined;
  }
  const piecesToSell = -sell.pieces;
  const [firstPosition, ...remaining] = positions.open;

  if (piecesToSell === firstPosition.pieces) {
    return closeFirstPositionCompletely(
      firstPosition,
      remaining,
      positions.closed,
      sell
    );
  }

  if (piecesToSell < firstPosition.pieces) {
    return closeFirstPositionPartially(
      firstPosition,
      remaining,
      positions.closed,
      sell,
      piecesToSell
    );
  }

  return closeFirstPositionAndContinue(
    firstPosition,
    remaining,
    positions.closed,
    sell,
    piecesToSell
  );
}

function closeFirstPositionCompletely(
  firstPosition: OpenPosition,
  remaining: OpenPosition[],
  closedPositions: ClosedPosition[],
  sell: Order
): Positions {
  const newPosition: ClosedPosition = {
    ...firstPosition,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee: firstPosition.orderFee + sell.orderFee,
    taxes: firstPosition.taxes + sell.taxes,
  };

  return {
    open: remaining,
    closed: [...closedPositions, newPosition],
  };
}

function closeFirstPositionPartially(
  firstPosition: OpenPosition,
  remaining: OpenPosition[],
  closedPositions: ClosedPosition[],
  sell: Order,
  piecesToSell: number
): Positions {
  const newlyClosed: ClosedPosition = {
    ...firstPosition,
    pieces: piecesToSell,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee:
      (piecesToSell / firstPosition.pieces) * firstPosition.orderFee +
      sell.orderFee,
    taxes:
      (piecesToSell / firstPosition.pieces) * firstPosition.taxes + sell.taxes,
    dividendPayouts: firstPosition.dividendPayouts.map((payout) => ({
      ...payout,
      pieces: piecesToSell,
    })),
  };
  const reducedPosition: OpenPosition = {
    ...firstPosition,
    pieces: firstPosition.pieces - piecesToSell,
    orderFee:
      (1 - piecesToSell / firstPosition.pieces) * firstPosition.orderFee,
    taxes: (1 - piecesToSell / firstPosition.pieces) * firstPosition.taxes,
    dividendPayouts: firstPosition.dividendPayouts.map((payout) => ({
      ...payout,
      pieces: firstPosition.pieces - piecesToSell,
    })),
  };

  return {
    open: [reducedPosition, ...remaining],
    closed: [...closedPositions, newlyClosed],
  };
}

function closeFirstPositionAndContinue(
  firstPosition: OpenPosition,
  remainingOpen: OpenPosition[],
  closedPositions: ClosedPosition[],
  sell: Order,
  piecesToSell: number
): Positions | undefined {
  const newPosition: ClosedPosition = {
    ...firstPosition,
    sellPrice: sell.sharePrice,
    sellDate: sell.timestamp,
    orderFee:
      firstPosition.orderFee +
      (firstPosition.pieces / piecesToSell) * sell.orderFee,
    taxes:
      firstPosition.taxes + (firstPosition.pieces / piecesToSell) * sell.taxes,
  };
  const piecesStillToSell = piecesToSell - firstPosition.pieces;

  return updatePositionsWithSell(
    { open: remainingOpen, closed: [...closedPositions, newPosition] },
    {
      ...sell,
      pieces: -piecesStillToSell,
      orderFee: (1 - firstPosition.pieces / piecesToSell) * sell.orderFee,
      taxes: (1 - firstPosition.taxes / piecesToSell) * sell.taxes,
    }
  );
}

const orderToOpenPosition = (order: Order): OpenPosition => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
  taxes: order.taxes,
  dividendPayouts: [],
});

export const getPositionInitialValue = (position: OpenPosition): number =>
  position.pieces * position.buyPrice;

function updatePositionsWithBuy(
  positions: Positions,
  buy: Order
): Positions | undefined {
  if (buy.pieces < 0) {
    return undefined;
  }

  return {
    closed: positions.closed,
    open: [...positions.open, orderToOpenPosition(buy)],
  };
}
