import jwt from "jsonwebtoken";
import axios from "axios";
import https from "https";

const a3sURL = "https://127.0.0.1:44443";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const demonstrateCloaking = async (req, res) => {
    try {
        const token =
            req.cookies["x-a3s-token"] ||
            req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        console.log("🔑 Original token received for cloaking demonstration");

        // Decode the original token
        const originalDecoded = jwt.decode(token);
        console.log("📄 Original token decoded");

        // Get the cloak parameters from the request
        const cloakParams = req.query.cloak?.split(",").filter(Boolean) || [
            "role",
            "accesslevel",
        ];
        console.log("🎭 Cloak parameters:", cloakParams);

        // Use the /issue endpoint with A3S source type and cloaking
        console.log("🚀 Sending request to A3S /issue endpoint for cloaking");
        const issueResponse = await axios.post(
            `${a3sURL}/issue`,
            {
                sourceType: "A3S",
                inputA3S: {
                    token: token,
                },
                audience: ["https://127.0.0.1:44443"],
                cloak: cloakParams,
            },
            {
                headers: { "Content-Type": "application/json" },
                httpsAgent,
            }
        );

        console.log("📨 A3S /issue response received");

        // Get the cloaked token from the response body
        const cloakedToken = issueResponse.data?.token;

        if (!cloakedToken) {
            console.log("❌ No cloaked token returned from A3S");
            return res.status(400).json({ error: "No cloaked token returned" });
        }

        console.log("🔑 Cloaked token received");

        // Decode the cloaked token
        const cloakedDecoded = jwt.decode(cloakedToken);
        console.log("📄 Cloaked token decoded");

        // Return both tokens for comparison
        res.json({
            originalToken: {
                identity: originalDecoded?.identity || [],
                claims: originalDecoded || {},
            },
            cloakedToken: {
                identity: cloakedDecoded?.identity || [],
                claims: cloakedDecoded || {},
            },
            cloakParams: cloakParams,
        });
    } catch (err) {
        console.error("❌ Cloak demonstration error:", err.message);
        if (err.response) {
            console.error("Response status:", err.response.status);
            console.error("Response data:", err.response.data);
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
