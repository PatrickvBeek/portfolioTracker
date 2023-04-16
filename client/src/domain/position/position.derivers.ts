import { fork, last, sort, sum } from "radash";
import { getOrderDate } from "../order/order.derivers";
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

  return sellOrders.reduce<Positions | undefined>(getPositionsFromSell, {
    open: openPositions,
    closed: [],
  });
}

function getPositionsFromSell(
  positions: Positions | undefined,
  sell: Order
): Positions | undefined {
  if (!positions || sell.pieces > 0 || positions.open.length < 1) {
    return undefined;
  }

  const piecesToSell = -sell.pieces;
  const [firstPosition, ...remaining] = positions.open;

  if (piecesToSell === firstPosition.pieces) {
    return {
      open: remaining,
      closed: [
        ...positions.closed,
        {
          ...firstPosition,
          sellPrice: sell.sharePrice,
          sellDate: sell.timestamp,
          orderFee: firstPosition.orderFee + sell.orderFee,
        },
      ],
    };
  }
  if (piecesToSell < firstPosition.pieces) {
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
      closed: [...positions.closed, newlyClosed],
    };
  } else {
    const newlyClosed: ClosedPosition = {
      ...firstPosition,
      sellPrice: sell.sharePrice,
      sellDate: sell.timestamp,
      orderFee:
        firstPosition.orderFee +
        (firstPosition.pieces / piecesToSell) * sell.orderFee,
    };
    const piecesStillToSell = piecesToSell - firstPosition.pieces;
    return getPositionsFromSell(
      { open: remaining, closed: [...positions.closed, newlyClosed] },
      {
        ...sell,
        pieces: -piecesStillToSell,
        orderFee: (1 - firstPosition.pieces / piecesToSell) * sell.orderFee,
      }
    );
  }
}

const orderToOpenPosition = (order: Order): OpenPosition => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
});

export function getPositionHistory(
  orders: Order[]
): PositionHistory | undefined {
  const history = orders.reduce<PositionHistory>((history, order) => {
    const oldPositions = last(history)?.positions || { open: [], closed: [] };
    const newPositions = getPositionsFromOrder(oldPositions, order);
    if (!newPositions) {
      return history;
    }
    return [...history, { date: getOrderDate(order), positions: newPositions }];
  }, [] as PositionHistory);

  if (history.length !== orders.length) {
    return undefined;
  }

  return history;
}

function getPositionsFromOrder(
  positions: Positions | undefined,
  order: Order
): Positions | undefined {
  if (!positions) {
    return undefined;
  }
  return order.pieces < 0
    ? getPositionsFromSell(positions, order)
    : getPositionsFromBuy(positions, order);
}

function getPositionsFromBuy(
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
