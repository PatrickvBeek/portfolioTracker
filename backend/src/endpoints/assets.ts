import { Express, Request, Response } from "express";
import path from "path";
import { config } from "../config";
import { JsonWriter } from "../storage/jsonWriter/jsonWriter";

export const handleAssets = (app: Express, env: string): void => {
  const ASSET_DIR = path.join(config.DATA_DIR, env, "json", "assets");
  const ASSET_FILE = "AssetLibrary";
  const persistance = new JsonWriter(ASSET_DIR);

  const isDev = env === "development";

  app.get("/api/assets", async (_: Request, res: Response) => {
    isDev && console.log("GET /api/assets");
    const lib = await persistance.read(ASSET_FILE);
    isDev && console.log(JSON.stringify(lib, null, 4));
    res.json(await persistance.read(ASSET_FILE));
  });

  app.put("/api/assets", async (req: Request, res: Response) => {
    isDev &&
      console.log(
        "PUT /api/assets/save-assets",
        JSON.stringify(req.body, null, 4)
      );
    await persistance.write(req.body, ASSET_FILE);
    res.status(200);
    res.send();
  });
};
