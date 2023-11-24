import express, { Express, Request, Response } from "express";
import { config } from "./config";
import { handleAssets } from "./endpoints/assets";
import { handlePortfolios } from "./endpoints/portfolios";

const app: Express = express();
app.use(express.json());

const isDev = config.NODE_ENV === "development";

app.get("/express_backend", (req: Request, res: Response) => {
  isDev && console.log("GET /express_backend");
  res.send({ express: `connected to ${config.NODE_ENV} backend` });
});

handleAssets(app, config.NODE_ENV);
handlePortfolios(app, config.NODE_ENV);

export default app;
