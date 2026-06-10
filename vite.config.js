import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  server: {
    open: "/",
    hmr: false,
  },
});
