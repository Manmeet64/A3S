import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import https from "https";

dotenv.config();

const app = express();
const port = 3000;

// CORS Setup
const allowedOrigins = [
    "http://localhost:3000", // React frontend
    "https://127.0.0.1:44443", // A3S UI
    "http://127.0.0.1:3000", // Alternative React dev URL
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log(`Blocked by CORS: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    })
);

app.use(express.json());
app.use(
    session({
        secret: "super-secret-session-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// 👇 Callback route for A3S redirect
app.get("/callback", (req, res) => {
    const { access_token, id_token } = req.query;

    if (!access_token || !id_token) {
        return res.status(400).send("Access token or ID token not found");
    }

    req.session.tokens = { access_token, id_token };
    console.log("Tokens received and stored in session:", req.session.tokens);

    res.redirect("http://localhost:3000/dashboard");
});

app.post("/issue", async (req, res) => {
    try {
        const a3sResponse = await axios.post(
            "https://127.0.0.1:44443/issue",
            req.body,
            {
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                headers: { "Content-Type": "application/json" },
            }
        );

        const data = a3sResponse.data;
        console.log("A3S response:", data);

        if (data.token) {
            console.log("✅ Token received, setting cookie...");
            res.cookie("x-a3s-token", data.token, {
                httpOnly: true,
                secure: true,
                sameSite: "None", // required for cross-origin in dev
            });
            return res.status(200).json({ message: "Token issued and set" });
        }

        if (data.inputOIDC && data.inputOIDC.authURL) {
            console.log("🌐 OIDC step required. Redirecting...");
            return res.status(302).json({ redirect: data.inputOIDC.authURL });
        }

        return res.status(400).json({ error: "No token or OIDC URL returned" });
    } catch (error) {
        console.error("❌ Error issuing token:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// 👇 Protected test route
app.get("/profile", (req, res) => {
    if (!req.session.tokens) {
        return res.status(401).send("Unauthorized");
    }

    res.send(
        `You are logged in. Here's your ID token: ${req.session.tokens.id_token}`
    );
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
