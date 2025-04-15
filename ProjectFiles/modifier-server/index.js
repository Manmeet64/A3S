import express from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

// Import routes or define them inline
const modifierRoutes = (app) => {
    // Add raw body parsing for the /modify endpoint
    app.post("/modify", (req, res) => {
        console.log("=== NEW REQUEST RECEIVED ===");
        console.log("Request headers:", req.headers);

        // Create a buffer to collect data chunks
        let data = [];

        req.on("data", (chunk) => {
            data.push(chunk);
        });

        req.on("end", () => {
            let claims = [];
            try {
                // Concatenate chunks and convert to string
                const rawData = Buffer.concat(data).toString();
                console.log("Raw request data:", rawData);

                // Try to parse as JSON
                try {
                    claims = JSON.parse(rawData);
                    console.log("Parsed claims as JSON:", claims);
                } catch (jsonError) {
                    console.error("Failed to parse JSON:", jsonError.message);

                    // Try to parse using eval if it looks like an array
                    if (rawData.startsWith("[") && rawData.endsWith("]")) {
                        try {
                            // Be careful with eval - only use it for this specific case
                            claims = eval(`(${rawData})`);
                            console.log("Parsed claims using eval:", claims);
                        } catch (evalError) {
                            console.error(
                                "Failed to parse with eval:",
                                evalError.message
                            );
                        }
                    }
                }
            } catch (e) {
                console.error("Error processing request body:", e.message);
            }

            if (!Array.isArray(claims)) {
                console.warn("Invalid claims format, expected array");
                claims = [];
            }

            // Extract email from claims
            let email = null;
            for (const claim of claims) {
                if (typeof claim === "string" && claim.startsWith("email=")) {
                    email = claim.split("=", 2)[1];
                    break;
                }
            }

            console.log(`Extracted email: ${email}`);

            // Add custom claims based on email domain
            if (email) {
                if (email.includes("isu.ac.in")) {
                    claims.push("role=student");
                    const yearMatch = email.match(/(\d{4})\./);
                    if (yearMatch) {
                        const batchYear = yearMatch[1];
                        claims.push(`batch=${batchYear}`);
                    }
                    claims.push("department=engineering");
                    claims.push("accesslevel=restricted");
                } else if (email.includes("gmail.com")) {
                    claims.push("role=admin");
                    claims.push("accesslevel=full");
                } else {
                    claims.push("role=guest");
                    claims.push("accesslevel=restricted");
                }
            }

            console.log(`Modified claims: ${claims}`);
            res.json(claims);
        });
    });

    app.get("/", (req, res) => {
        res.json({
            status: "healthy",
            message: "A3S modifier server is running",
        });
    });

    app.options("/modify", (req, res) => {
        res.status(200).end();
    });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const addresses = interfaces[interfaceName];
        for (const addr of addresses) {
            if (addr.family === "IPv4" && !addr.internal) {
                return addr.address;
            }
        }
    }
    return "0.0.0.0";
}

const localIp = getLocalIpAddress();
console.log(`Local IP address: ${localIp}`);

// Use absolute path to certificates
const certPath = "/Users/manmeetsingh/Desktop/a3s/certs";

const sslOptions = {
    cert: fs.readFileSync(path.join(certPath, "modifier-server-cert.pem")),
    key: fs.readFileSync(path.join(certPath, "modifier-server-key.pem")),
    ca: fs.readFileSync(path.join(certPath, "modifier-ca-cert.pem")),
    requestCert: true,
    rejectUnauthorized: false, // Similar to CERT_OPTIONAL in Python
};

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["POST", "OPTIONS", "GET"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Don't use express.json() middleware for the /modify endpoint
// We'll handle the raw body manually
app.use((req, res, next) => {
    if (req.path !== "/modify") {
        express.json()(req, res, next);
    } else {
        next();
    }
});

// Apply routes
modifierRoutes(app);

https.createServer(sslOptions, app).listen(8443, "0.0.0.0", () => {
    console.log(`Modifier HTTPS server running on https://${localIp}:8443`);
});
