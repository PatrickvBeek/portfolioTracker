import { fork, last, sort, sum } from "radash";
import { getNumericDateTime, getOrderDate } from "../order/order.derivers";
import { Order } from "../order/order.entities";
import {
  ClosedPosition,
  OpenPosition,
  PositionHistory,
  Positions,
} from "./position.entities";

export function getPositions(orders: Order[]): Positions | undefined {
  if (sum(orders, (order) => order.pieces) < 0) {
    return undefined;
  }

  const [buyOrders, sellOrders] = fork(
    sort(orders, (order) => new Date(order.timestamp).getTime()),
    (order) => order.pieces > 0
  );
  const openPositions: OpenPosition[] = buyOrders.map(orderToOpenPosition);

  return sellOrders.reduce<Positions | undefined>(updatePositionsWithSell, {
    open: openPositions,
    closed: [],
  });
}

export function getPositionHistory(orders: Order[]): PositionHistory {
  const history = sort(orders, getNumericDateTime).reduce<PositionHistory>(
    (history, order) => {
      const oldPositions = last(history)?.positions || { open: [], closed: [] };
      const newPositions = updatePositionsWithOrder(oldPositions, order);
      if (!newPositions) {
        return history;
      }
      return [
        ...history,
        { date: getOrderDate(order), positions: newPositions },
      ];
    },
    [] as PositionHistory
  );

  if (history.length !== orders.length) {
    return [];
  }

  return history;
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
    return closeEntireFirstPosition(
      firstPosition,
      remaining,
      positions.closed,
      sell
    );
  }

  if (piecesToSell < firstPosition.pieces) {
    return closePartialFirstPosition(
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

function closeEntireFirstPosition(
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
  };

  return {
    open: remaining,
    closed: [...closedPositions, newPosition],
  };
}

function closePartialFirstPosition(
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
  };
  const reducedPosition: OpenPosition = {
    ...firstPosition,
    pieces: firstPosition.pieces - piecesToSell,
    orderFee:
      (1 - piecesToSell / firstPosition.pieces) * firstPosition.orderFee,
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
  };
  const piecesStillToSell = piecesToSell - firstPosition.pieces;

  return updatePositionsWithSell(
    { open: remainingOpen, closed: [...closedPositions, newPosition] },
    {
      ...sell,
      pieces: -piecesStillToSell,
      orderFee: (1 - firstPosition.pieces / piecesToSell) * sell.orderFee,
    }
  );
}

const orderToOpenPosition = (order: Order): OpenPosition => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
});

export const getPositionInitialValue = (position: OpenPosition): number =>
  position.pieces * position.buyPrice;

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
