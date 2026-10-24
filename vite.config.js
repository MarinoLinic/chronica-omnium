import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { localEditor } from "./scripts/local-editor.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localEditor()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "catalog-data",
              test: /src[\\/]generated[\\/]catalog\.json/,
            },
          ],
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    strictPort: true,
    watch: {
      ignored: [
        "**/public/media/**",
        "**/public/data/**",
        "**/data/**",
        "**/.local/**",
      ],
    },
  },
});
