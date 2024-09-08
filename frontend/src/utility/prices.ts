export const toPrice = (p: number): string =>
  `${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00A0€`;
