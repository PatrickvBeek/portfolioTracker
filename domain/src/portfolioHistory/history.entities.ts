export type History<T> = HistoryPoint<T>[];

export type HistoryPoint<T> = { timestamp: number; value: T };
