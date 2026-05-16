/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react(), tailwindcss()],
    test: {
      globals: true,
      environment: "happy-dom",
      pool: "threads",
      setupFiles: "./src/setupTests.ts",
      deps: {
        optimizer: {
          client: {
            enabled: true,
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
