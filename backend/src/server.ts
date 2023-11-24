import express from "express";
import { config } from "./config";
import app from "./index";

app.use(express.static("../frontend/build"));

app.listen(config.PORT, () => console.log(`Listening on port ${config.PORT}`));
