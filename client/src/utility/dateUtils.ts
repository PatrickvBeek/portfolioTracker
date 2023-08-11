import moment from "moment";

export const areDatesOnSameDay = (d1: string, d2: string): boolean =>
  moment(d1).format("YYYYMMDD") === moment(d2).format("YYYYMMDD");
