import fs from "fs";
import { JsonWriter } from "./jsonWriter";

describe("The jsonWriter", () => {
  const path = "./test_data/jsonWriter_test";
  const name = "testObjectForJsonWriter";
  const file = `${path}/${name}.json`;
  const TEST_OBJECT = {
    prop1: "attr1",
    prop2: ["nested_attr1", "nested_attr2"],
  };
  let writer = new JsonWriter(path);
  it("can be instantiated", () => {
    const writer = new JsonWriter("data");
  });

  it("can generate the dataDir if not existent", async () => {
    fs.rmSync(path, { recursive: true, force: true });
    await writer.write(TEST_OBJECT, "DKB");
    expect(fs.existsSync(path)).toBe(true);
  });

  it("generates the json file with portfolio name", async () => {
    await writer.write(TEST_OBJECT, name);
    expect(fs.existsSync(file)).toBe(true);
  });

  it("can read a written portfolio back", async () => {
    await writer.write(TEST_OBJECT, name);
    const readObject = await writer.read(name);
    expect(readObject).toEqual(TEST_OBJECT);
  });
});
