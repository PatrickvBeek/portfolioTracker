export type Series<T> = SeriesPoint<T>[];

export type SeriesPoint<T> = { timestamp: number; value: T };
