import { defineConfig } from "vite";

const PRODUCTION_URL = "/web__playground__threejs-transparency/";

export default defineConfig(({ command, mode }) => {
  console.log(`[vite.config.js] command: ${command}, mode: ${mode}`);

  return {
    base: mode === "development" ? "" : PRODUCTION_URL,
    plugins: [],
    server: {
      host: true,
      port: 3001,
    },
  };
});
