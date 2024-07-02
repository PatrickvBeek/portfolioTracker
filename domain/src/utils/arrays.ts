export function accumulate(array: number[]): number[] {
  let sum = 0;
  return array.map((entry) => (sum += entry));
}

export function accumulateBy<T, U>(
  array: T[],
  predicate: (acc: U, el: T) => U,
  startValue: U,
): U[] {
  const result = [] as U[];

  array.reduce((acc, el) => {
    const newValueOfAcc = predicate(acc, el);
    result.push(newValueOfAcc);
    return newValueOfAcc;
  }, startValue);

  return result;
}

export function updateBy<T>(array: T[], predicate: (acc: T, el: T) => T): T[] {
  if (array.length < 2) {
    return array;
  }
  const [first, ...rest] = array;

  const result = [first];

  rest.reduce((acc, el) => {
    const newAcc = predicate(acc, el);
    result.push(newAcc);
    return newAcc;
  }, first);

  return result;
}
