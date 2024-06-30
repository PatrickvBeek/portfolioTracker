import path from "path";

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "127.0.0.1",
  PORT: process.env.PORT || "6060",
  DATA_DIR:
    process.env.PT_DATA_DIR || path.join(__filename, "../../../../../data"),
};
