export type ChartDataPoint<Keys extends string> = {
  timestamp: number;
} & Record<Keys, number | undefined>;

export type ChartData<Keys extends string> = ChartDataPoint<Keys>[];
