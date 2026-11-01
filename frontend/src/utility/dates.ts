export const addMonths = (timestamp: number, months: number): Date => {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return date;
};
