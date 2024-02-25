import { Express, Request, Response } from "express";
import path from "path";
import { JsonWriter } from "../storage/jsonWriter/jsonWriter";

export const handlePortfolios = (app: Express, env: string): void => {
  const isDev = env === "development";

  const PORTFOLIO_DIR = path.join(
    __dirname,
    "../../..",
    "data",
    env,
    "json",
    "portfolios"
  );
  const PORTFOLIO_FILE = "PortfolioLibrary";
  const persistance = new JsonWriter(PORTFOLIO_DIR);

  app.get("/api/portfolios", async (req: Request, res: Response) => {
    isDev && console.log("/api/portfolios");
    const persistedLib = await persistance.read(PORTFOLIO_FILE);
    isDev && console.log(JSON.stringify(persistedLib, null, 4));
    res.status(200).send(persistedLib);
  });

  app.put("/api/portfolios", (req: Request, res: Response) => {
    isDev && console.log("/api/portfolios");
    persistance.write(req.body, PORTFOLIO_FILE);
    res.status(200).send();
  });
};
