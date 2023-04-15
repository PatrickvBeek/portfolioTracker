import { accumulate } from "../arrays";

describe("the accumulate function", () => {
  it("returns the correct sum for an array of numbers", () => {
    expect(accumulate([1, 2, 3.5, -1])).toEqual([1, 3, 6.5, 5.5]);
  });

  it("returns an empty array if input is an empty array", () => {
    expect(accumulate([])).toEqual([]);
  });
});
