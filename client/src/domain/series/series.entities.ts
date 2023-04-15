export interface Series<T extends SeriesType> {
  seriesType: T;
  data: [Date, SeriesDataTypes[T]][];
}

type SeriesDataTypes = {
  invested_value: number;
};

type SeriesType = keyof SeriesDataTypes;
