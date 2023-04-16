import { fork, sort, sum } from "radash";
import { Order } from "../order/order.entities";
import {
  AssetPositions,
  ClosedPosition,
  OpenPosition,
} from "./position.entities";

export function getPositions(orders: Order[]): AssetPositions | undefined {
  if (sum(orders, (order) => order.pieces) < 0) {
    return undefined;
  }

  const [buyOrders, sellOrders] = fork(
    sort(orders, (order) => new Date(order.timestamp).getTime()),
    (order) => order.pieces > 0
  );
  const openPositions: OpenPosition[] = buyOrders.map(orderToOpenPosition);

  return sellOrders.reduce(
    (positions: AssetPositions, sell) => {
      const [stillOpen, closedFromSell] = getPositionsFromSell(
        positions.open,
        sell
      );
      return {
        open: stillOpen,
        closed: [...positions.closed, ...closedFromSell],
      };
    },
    { open: openPositions, closed: [] }
  );
}

function getPositionsFromSell(
  openPositions: OpenPosition[],
  sell: Order
): [OpenPosition[], ClosedPosition[]] {
  const piecesToSell = -sell.pieces;
  const [firstPosition, ...remaining] = openPositions;

  if (piecesToSell === firstPosition.pieces) {
    return [
      remaining,
      [
        {
          ...firstPosition,
          sellPrice: sell.sharePrice,
          sellDate: sell.timestamp,
          orderFee: firstPosition.orderFee + sell.orderFee,
        },
      ],
    ];
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
    return [[reducedPosition, ...remaining], [newlyClosed]];
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
    const [finallyOpen, alsoClosed] = getPositionsFromSell(remaining, {
      ...sell,
      pieces: -piecesStillToSell,
      orderFee: (1 - firstPosition.pieces / piecesToSell) * sell.orderFee,
    });
    return [finallyOpen, [newlyClosed, ...alsoClosed]];
  }
}

const orderToOpenPosition = (order: Order): OpenPosition => ({
  pieces: order.pieces,
  buyDate: order.timestamp,
  buyPrice: order.sharePrice,
  orderFee: order.orderFee,
});
