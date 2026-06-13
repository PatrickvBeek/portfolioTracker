/** Array of history points in ascending timestamp order (oldest first). */
export type History<T> = HistoryPoint<T>[];

export type HistoryPoint<T> = { timestamp: number; value: T };
