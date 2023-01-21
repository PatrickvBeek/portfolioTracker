import { Express, Request, Response } from "express";
import { JsonWriter } from "../storage/jsonWriter/jsonWriter";

export const handlePortfolios = (app: Express, env: string): void => {
  const isDev = env === "development";

  const PORTFOLIO_DIR = `../data/${env}/json/portfolios`;
  const PORTFOLIO_FILE = "PortfolioLibrary";
  const persistance = new JsonWriter(PORTFOLIO_DIR);

  app.get("/portfolios/get-portfolios", async (req: Request, res: Response) => {
    isDev && console.log("/portfolios/get-portfolios");
    const persistedLib = await persistance.read(PORTFOLIO_FILE);
    isDev && console.log(JSON.stringify(persistedLib, null, 4));
    res.status(200).send(persistedLib);
  });

  app.put("/portfolios/save-portfolios", (req: Request, res: Response) => {
    isDev && console.log("/portfolios/add-portfolios");
    persistance.write(req.body, PORTFOLIO_FILE);
    res.status(200).send();
  });
};
