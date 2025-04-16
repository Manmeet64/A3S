import axios from "axios";
import https from "https";

const a3s_url = "https://127.0.0.1:44443";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const authenticate = async (req, res, next) => {
    console.log("Starting authentication process...");
    console.log("Request path:", req.path);
    console.log("Request method:", req.method);

    // Token extraction from Authorization header only
    let token;
    const auth = req.headers.authorization?.split(" ");
    if (auth?.[0] === "Bearer" && auth[1]) {
        token = auth[1];
        console.log("Token from Authorization header found");
    }

    if (!token) {
        console.log("❌ No token found in Authorization header");
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        // Path parsing
        const pathParts = req.path.split("/").filter(Boolean);
        console.log("Path parts:", pathParts);

        if (pathParts.length < 2) {
            console.log("❌ Invalid path structure");
            return res.status(400).json({ error: "Invalid path" });
        }

        const namespace = `/${pathParts.slice(0, 2).join("/")}`;
        const resource = pathParts[2] || "";
        console.log("Namespace:", namespace);
        console.log("Resource:", resource);

        // Map HTTP method to action
        let action;
        switch (req.method) {
            case "GET":
                action = "get";
                break;
            case "POST":
                action = "create";
                break;
            case "PUT":
            case "PATCH":
                action = "update";
                break;
            case "DELETE":
                action = "delete";
                break;
            default:
                action = "get";
        }
        console.log("Mapped HTTP method to action:", action);

        // Request body (for POST/PUT requests)
        let requestBody = {};
        if (
            req.method === "POST" ||
            req.method === "PUT" ||
            req.method === "PATCH"
        ) {
            requestBody = req.body || {};
            console.log("Request body:", JSON.stringify(requestBody, null, 2));
        }

        // Authorization body
        const authzBody = {
            token,
            action,
            resource,
            namespace,
        };
        console.log(
            "Authorization request body:",
            JSON.stringify(authzBody, null, 2)
        );

        // Making request to A3S
        console.log("Sending authorization request to A3S...");
        const response = await axios.post(`${a3s_url}/authz`, authzBody, {
            headers: {
                "Content-Type": "application/json",
                // "X-A3S-Modifier-URL": "https://192.168.1.34:8443/modify"  // Add modifier URL
            },
            httpsAgent,
        });
        console.log("A3S response status:", response.status);
        if (response.data) {
            console.log(
                "A3S response data:",
                JSON.stringify(response.data, null, 2)
            );
        }

        if (response.status === 204) {
            console.log("Authorization successful");
            return next();
        }

        console.log("Authorization denied");
        return res.status(403).json({ error: "Not authorized" });
    } catch (err) {
        console.error("Authorization error:", err.message);
        if (err.response) {
            console.error("Response status:", err.response.status);
            console.error("Response data:", err.response.data);
        }
        return res.status(500).json({ error: "Authorization failed" });
    }
};
