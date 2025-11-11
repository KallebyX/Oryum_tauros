import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "server/**/*.test.ts", "server/**/*.spec.ts"],
    exclude: ["tests/e2e/**/*"],
  },
});
