import axios from "axios";
import https from "https";
import jwt from "jsonwebtoken";

const a3sURL = "https://127.0.0.1:44443"; // Direct A3S URL without modifier
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const publicRoute = (req, res) => {
    res.send("University Portal API Running");
};

export const adminDashboard = (req, res) => {
    res.json({ message: "Admin Dashboard Access Granted" });
};

export const studentPortal = (req, res) => {
    res.json({ message: "Student Portal Access Granted" });
};

export const coursesPortal = (req, res) => {
    res.json({ message: "Courses Portal Access Granted" });
};

export const loginPage = async (req, res) => {
    try {
        const response = await axios.get(`${a3sURL}/ui/login.html`, {
            params: req.query,
            headers: req.headers,
            httpsAgent,
        });
        res.send(response.data);
    } catch (err) {
        console.error("Login page error:", err.message);
        res.status(503).json({ error: "Login service unavailable" });
    }
};

export const issueToken = async (req, res) => {
    try {
        const reqData = req.body;
        console.log("📦 Issue request body:", JSON.stringify(reqData, null, 2));

        if (reqData?.cookie === true) reqData.cookie = false;

        // Ensure the audience is correctly set as an array
        reqData.audience = ["https://127.0.0.1:44443"];

        console.log("Modified request body:", JSON.stringify(reqData, null, 2));

        const response = await axios.post(`${a3sURL}/issue`, reqData, {
            headers: { "Content-Type": "application/json" },
            httpsAgent,
        });

        console.log(
            "A3S response data:",
            JSON.stringify(response.data, null, 2)
        );

        const token = response.data?.token;

        if (token) {
            res.cookie("x-a3s-token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
            }).json(response.data);
        } else {
            res.json(response.data);
        }
    } catch (err) {
        console.error("Issue token error:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const decodeToken = (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }

        console.log("Received token for decoding");

        // Decode the token without verifying signature
        // This allows us to see the payload even if we don't have the secret key
        const decoded = jwt.decode(token, { complete: true });

        if (!decoded) {
            return res.status(400).json({ error: "Invalid token format" });
        }

        console.log("Token decoded successfully");

        // Return the decoded token information
        return res.json({
            header: decoded.header,
            payload: decoded.payload,
            // Don't return the signature for security reasons
            exp: decoded.payload.exp
                ? new Date(decoded.payload.exp * 1000).toISOString()
                : null,
            iat: decoded.payload.iat
                ? new Date(decoded.payload.iat * 1000).toISOString()
                : null,
        });
    } catch (error) {
        console.error("Token decode error:", error.message);
        return res
            .status(500)
            .json({ error: `Failed to decode token: ${error.message}` });
    }
};

export const logout = (req, res) => {
    res.clearCookie("x-a3s-token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });
    res.json({ message: "Logged out successfully" });
};
