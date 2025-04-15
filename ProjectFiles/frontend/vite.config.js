import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        https: {
            key: fs.readFileSync("./ssl/localhost-key.pem"),
            cert: fs.readFileSync("./ssl/localhost.pem"),
        },
        // port: 3000, // optional: customize your dev server port
    },
});
