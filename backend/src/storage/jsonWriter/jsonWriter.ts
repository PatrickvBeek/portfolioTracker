import { storage } from "../general";
import fs from "fs";

export class JsonWriter implements storage {
  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }
  dataDir = "./";
  async write(object: object, fileName: string): Promise<void> {
    await fs.promises.mkdir(this.dataDir, { recursive: true });
    let fileContent: string = JSON.stringify(object, null, 2);
    await fs.promises.writeFile(
      `${this.dataDir}/${fileName}.json`,
      fileContent,
      "utf-8"
    );
  }
  async read(fileName: string): Promise<any> {
    try {
      const fileContent = (
        await fs.promises.readFile(`${this.dataDir}/${fileName}.json`)
      ).toString();
      return JSON.parse(fileContent);
    } catch {
      this.write({}, fileName);
      return {};
    }
  }
}
