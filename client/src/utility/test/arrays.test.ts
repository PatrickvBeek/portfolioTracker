import { accumulate, accumulateBy, updateBy } from "../arrays";

describe("the accumulate function", () => {
  it("returns the correct sum for an array of numbers", () => {
    expect(accumulate([1, 2, 3.5, -1])).toEqual([1, 3, 6.5, 5.5]);
  });

  it("returns an empty array if input is an empty array", () => {
    expect(accumulate([])).toEqual([]);
  });
});

describe("the accumulateBy function", () => {
  it("accumulates a tuple by summing the second values", () => {
    const inputArr: [string, number][] = [
      ["1", 1],
      ["2", 2],
      ["3", 3],
    ];

    expect(accumulateBy(inputArr, (acc, el) => el[1] + acc, 0)).toEqual([
      1, 3, 6,
    ]);
  });
});

describe("the updateBy function", () => {
  it("updates an array of objects", () => {
    const objects: { label: string; value: number }[] = [
      { label: "not important", value: 1 },
      { label: "bla", value: 2 },
      { label: "ab cd", value: 3 },
    ];

    const result = updateBy(objects, (acc, el) => ({
      ...el,
      value: el.value + acc.value,
    }));

    expect(result).toEqual([
      { label: "not important", value: 1 },
      { label: "bla", value: 3 },
      { label: "ab cd", value: 6 },
    ]);
  });
});
