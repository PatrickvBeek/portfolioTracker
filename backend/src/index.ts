import express, { Express, Request, Response } from "express";
import { config } from "./config";
import { handlePrices } from "./endpoints/prices";

const app: Express = express();
app.use(express.json());

app.get("/express_backend", (_: Request, res: Response) => {
  res.send({ express: `connected to ${config.NODE_ENV} backend` });
});

handlePrices(app);

export default app;
