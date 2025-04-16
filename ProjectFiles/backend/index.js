import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// app.use(express.json());
app.use(
    cors({
        origin: "https://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "OPTIONS", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Set-Cookie"],
    })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", routes);

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "localhost-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "localhost.pem")),
};

https.createServer(sslOptions, app).listen(3000, () => {
    console.log("✅ Express HTTPS Server running on https://localhost:3000");
});
