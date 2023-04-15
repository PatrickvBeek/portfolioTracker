export function accumulate(array: number[]): number[] {
  let sum = 0;
  return array.map((entry) => (sum += entry));
}
