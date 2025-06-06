import { defineConfig } from "@tanstack/react-start/config"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  server: {
    preset: "bun",
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
})
