import logger from "../logger.js";

export const modifyClaims = (req, res) => {
    logger.debug("=== NEW REQUEST RECEIVED ===");
    logger.debug("Request headers: %o", req.headers);
    logger.debug("Request body: %o", req.body);

    let claims = [];

    try {
        claims = Array.isArray(req.body) ? req.body : [];
        logger.info("Parsed claims: %o", claims);
    } catch (e) {
        logger.error("Failed to parse request body: %s", e.message);
    }

    let email = null;
    for (const claim of claims) {
        if (typeof claim === "string" && claim.startsWith("email=")) {
            email = claim.split("=")[1];
            break;
        }
    }

    logger.info(`Extracted email: ${email}`);

    if (email) {
        if (email.includes("isu.ac.in")) {
            claims.push("role=student");

            const match = email.match(/(\d{4})\./);
            if (match) {
                claims.push(`batch=${match[1]}`);
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

    logger.info("Modified claims: %o", claims);
    res.json(claims);
};

export const healthCheck = (req, res) => {
    res.json({ status: "healthy", message: "A3S modifier server is running" });
};
