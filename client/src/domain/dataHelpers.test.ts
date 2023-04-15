import { getElementsGroupedByAsset, getTestOrder } from "./dataHelpers";

describe("the mock data util function", () => {
  describe("getElementsByAsset", () => {
    it("returns an accumulated object by asset", () => {
      const testOrder = getTestOrder({});
      const orders = ["abc", "def", "abc", "a4se"].map((isin) =>
        getTestOrder({ ...testOrder, asset: isin })
      );

      expect(getElementsGroupedByAsset(orders)).toEqual({
        abc: [
          { ...testOrder, asset: "abc" },
          { ...testOrder, asset: "abc" },
        ],
        def: [{ ...testOrder, asset: "def" }],
        a4se: [{ ...testOrder, asset: "a4se" }],
      });
    });
  });
});
