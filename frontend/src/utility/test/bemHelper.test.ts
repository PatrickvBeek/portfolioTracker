import { bemHelper } from "../bemHelper";

describe("bemHelper builds class names", () => {
  const { bemBlock, bemElement } = bemHelper("my-component");

  describe("for block", () => {
    it("without modifiers", () => {
      expect(bemBlock(undefined)).toEqual("my-component");
    });

    it("with extra class name", () => {
      expect(bemBlock("another-class")).toEqual("my-component another-class");
    });

    describe("with modifiers", () => {
      it("as string", () => {
        expect(bemBlock(undefined, "mod")).toEqual(
          "my-component my-component--mod",
        );
      });

      it("as array of strings", () => {
        expect(bemBlock(undefined, ["mod1", "mod2", ""])).toEqual(
          "my-component my-component--mod1 my-component--mod2",
        );
      });

      it("as object", () => {
        expect(bemBlock(undefined, { mod1: true, mod2: false })).toEqual(
          "my-component my-component--mod1",
        );
      });

      it("as falsy", () => {
        expect(bemBlock(undefined, "")).toEqual("my-component");
      });
    });
  });

  describe("for element", () => {
    it("without modifiers", () => {
      expect(bemElement("element")).toEqual("my-component__element");
    });

    describe("with modifiers", () => {
      it("as string", () => {
        expect(bemElement("element", "mod")).toEqual(
          "my-component__element my-component__element--mod",
        );
      });

      it("as array of strings", () => {
        expect(bemElement("element", ["mod1", "mod2", ""])).toEqual(
          "my-component__element my-component__element--mod1 my-component__element--mod2",
        );
      });

      it("as object", () => {
        expect(bemElement("element", { mod1: true, mod2: false })).toEqual(
          "my-component__element my-component__element--mod1",
        );
      });

      it("as falsy", () => {
        expect(bemElement("element", "")).toEqual("my-component__element");
      });
    });
  });
});
