import express from "express";
import path from "path";
import { config } from "./config";
import app from "./index";

const frontendBuildPath = path.join(__dirname, "..", "..", "frontend", "build");
app.use(express.static(frontendBuildPath));

app.listen(config.PORT, () => console.log(`Listening on port ${config.PORT}`));
