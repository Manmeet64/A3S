import express from "express";
import https from "https";
import fs from "fs";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ Added

const app = express();
const selfUrl = "https://localhost:5000";
const a3sUrl = "https://127.0.0.1:44443"; // A3S backend URL

// ✅ Enable CORS to allow A3S to send requests
app.use(
    cors({
        origin: a3sUrl, // Allow A3S to make requests
        credentials: true,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(cookieParser());
app.use(express.json());

// Public route
app.get("/", (req, res) => {
    res.send(
        "✅ HTTPS server is running! Go to <a href='/secret?rlogin'>/secret</a>"
    );
});

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.cookies?.["x-a3s-token"];
    const hasRlogin = req.query.rlogin !== undefined;

    console.log("🍪 Cookies received:", req.cookies);
    console.log("🔐 Token from x-a3s-token:", token);

    if (token) {
        return next();
    }

    if (!token && hasRlogin) {
        return res.redirect(
            `${selfUrl}/login?proxy=${selfUrl}&redirect=${selfUrl}${req.path}&audience=testapp`
        );
    }

    return res.status(403).send("❌ Forbidden: No token");
};

// Protected route
app.get("/secret", authenticate, (req, res) => {
    res.send("🔐 You have accessed the secret route!");
});

// A3S-powered login route
app.get("/login", (req, res) => {
    const params = new URLSearchParams(req.query).toString();
    res.redirect(`${a3sUrl}/ui/login.html?${params}`);
});

// ✅ New route to receive token from A3S and set it as a cookie
// ✅ Proxying the /issue request to A3S
app.post("/issue", async (req, res) => {
    try {
        const response = await axios.post(`${a3sUrl}/issue`, req.body, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // 🔐 Skip SSL check for self-signed certs (dev only!)
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const token = response.data?.token;

        if (!token) {
            return res.status(400).send("❌ Token not returned from A3S");
        }

        console.log("📥 Token from A3S issued:", token);

        res.cookie("x-a3s-token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None", // Required for cross-origin
        });

        res.status(200).json({ message: "✅ Token set in cookie" });
    } catch (error) {
        console.error("❌ Error issuing token from A3S:", error.message);
        const msg = error.response?.data || "❌ A3S issue request failed";
        res.status(500).send(msg);
    }
});

// HTTPS server setup
https
    .createServer(
        {
            key: fs.readFileSync("server.key"),
            cert: fs.readFileSync("server.cert"),
        },
        app
    )
    .listen(3000, () => {
        console.log("✅ Server running on https://localhost:3000");
    })
    .on("error", (err) => {
        console.error("❌ HTTPS server failed to start:", err);
    });
