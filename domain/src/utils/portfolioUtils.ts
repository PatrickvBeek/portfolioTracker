const DELIMITER = "::";

export const toCompoundPortfolioName = (names: string[]): string =>
  names.join(DELIMITER);

export const getPortfolioNamesFromCompound = (compoundName: string): string[] =>
  compoundName.split(DELIMITER);

export const isCompoundPortfolioName = (name: string): boolean =>
  name.includes(DELIMITER);
