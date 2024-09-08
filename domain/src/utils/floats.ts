const EPSILON = Math.pow(2, -24);

export const areFloatsEqual = (
  a: number,
  b: number,
  epsilon = EPSILON
): boolean => Math.abs(a - b) < epsilon;

export const isFloatLowerThan = (a: number, b: number, epsilon = EPSILON) =>
  b - a > epsilon;

export const isFloatGraterThan = (a: number, b: number, epsilon = EPSILON) =>
  a - b > epsilon;

export const isFloatPositive = (a: number, epsilon = EPSILON): boolean =>
  isFloatGraterThan(a, 0, epsilon);

export const isFloatNegative = (a: number, epsilon = EPSILON): boolean =>
  isFloatLowerThan(a, 0, epsilon);
