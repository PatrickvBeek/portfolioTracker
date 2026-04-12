/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
      pool: "threads",
      setupFiles: "./src/setupTests.ts",
      deps: {
        optimizer: {
          client: {
            enabled: true,
            include: ["@mui/icons-material"],
          },
        },
      },
      coverage: {
        reporter: ["text", "html"],
        exclude: ["node_modules/", "src/setupTests.ts"],
      },
    },
  };
});
