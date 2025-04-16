import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const [token, setToken] = useState(null);
    const [decodedToken, setDecodedToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCloaked, setIsCloaked] = useState(false);
    const [cloakData, setCloakData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get token from localStorage
        const storedToken = localStorage.getItem("a3s_access_token");
        if (!storedToken) {
            alert("No authentication token found. Please login first.");
            navigate("/login");
            return;
        }
        setToken(storedToken);

        // Decode token using backend endpoint
        fetchTokenData(storedToken, isCloaked);
    }, [navigate, isCloaked]);

    const fetchTokenData = async (storedToken, useCloak) => {
        try {
            setIsLoading(true);

            if (useCloak) {
                // Fetch cloaked token data
                const response = await fetch(
                    "https://localhost:3000/demonstrate-cloak?cloak=role,accesslevel",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch cloaked token");
                }

                const data = await response.json();
                setCloakData(data);
                setDecodedToken(data.cloakedToken.claims);
                console.log(
                    "Cloaked token data (raw):",
                    data.cloakedToken.claims
                );
                console.log(
                    "Cloaked token data (stringified):",
                    JSON.stringify(data.cloakedToken.claims)
                );
            } else {
                // Fetch regular decoded token
                const response = await fetch("https://localhost:3000/decode", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: storedToken }),
                });

                if (!response.ok) {
                    throw new Error("Failed to decode token");
                }

                const data = await response.json();
                setDecodedToken(data.payload);
                setCloakData(null);
                console.log("Decoded token data (raw):", data.payload);
                console.log(
                    "Decoded token data (stringified):",
                    JSON.stringify(data.payload)
                );
            }

            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching token data:", error);
            setIsLoading(false);
        }
    };

    const toggleCloakedToken = () => {
        setIsCloaked(!isCloaked);
    };

    return (
        <div className={styles.dashboardContainer}>
            <Navbar />
            <main className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1>University Dashboard</h1>
                        <p>Manage your authentication and authorization</p>
                    </div>
                    {!isLoading && decodedToken && (
                        <div className={styles.userGreeting}>
                            HI{" "}
                            {(() => {
                                // Check if identity array exists and contains role=admin
                                const isAdmin = decodedToken.identity?.some(
                                    (item) =>
                                        item.toLowerCase() === "role=admin"
                                );

                                return isAdmin ? "ADMIN" : "STUDENT";
                            })()}
                        </div>
                    )}
                </div>

                <div className={styles.authorizationSection}>
                    <h2>Authorization Levels</h2>

                    <div className={styles.authCards}>
                        <div className={styles.authCard}>
                            <h3>Admin Access</h3>
                            <ul className={styles.permissionList}>
                                <li>Access Admin page</li>
                                <li>GET and POST access to Users data</li>
                                <li>GET access to Settings data</li>
                                <li>GET and POST access to Resources data</li>
                            </ul>
                        </div>

                        <div className={styles.authCard}>
                            <h3>Student Access</h3>
                            <ul className={styles.permissionList}>
                                <li>Access Resources page</li>
                                <li>GET access to Grades data</li>
                                <li>GET access to Courses data</li>
                                <li>No access to Admin page</li>
                                <li>Limited to personal information only</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.tokenSection}>
                    <div className={styles.tokenHeader}>
                        <h2>Token Management</h2>
                        <button
                            onClick={toggleCloakedToken}
                            className={`${styles.cloakButton} ${
                                isCloaked ? styles.cloakActive : ""
                            }`}
                        >
                            {isCloaked
                                ? "View Original Token"
                                : "View Cloaked Token"}
                        </button>
                    </div>

                    <div className={styles.tokenCard}>
                        {isLoading ? (
                            <p>Loading token information...</p>
                        ) : (
                            <>
                                {isCloaked && cloakData && (
                                    <div className={styles.cloakInfo}>
                                        <h4>Token Cloaking Active</h4>
                                        <p>
                                            Cloaked parameters:{" "}
                                            {cloakData.cloakParams.join(", ")}
                                        </p>
                                    </div>
                                )}

                                <div className={styles.tokenInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>
                                            Issuer:
                                        </span>
                                        <span className={styles.value}>
                                            {decodedToken?.iss || "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>
                                            Subject:
                                        </span>
                                        <span className={styles.value}>
                                            {decodedToken?.sub || "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>
                                            Issued At:
                                        </span>
                                        <span className={styles.value}>
                                            {decodedToken?.iat
                                                ? new Date(
                                                      decodedToken.iat * 1000
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>
                                            Expires:
                                        </span>
                                        <span className={styles.value}>
                                            {decodedToken?.exp
                                                ? new Date(
                                                      decodedToken.exp * 1000
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.tokenJson}>
                                    <h4>Token Claims</h4>
                                    <pre>
                                        {decodedToken
                                            ? JSON.stringify(
                                                  decodedToken,
                                                  null,
                                                  2
                                              )
                                            : "No token data available"}
                                    </pre>
                                </div>

                                {isCloaked && cloakData && (
                                    <div className={styles.comparisonSection}>
                                        <h4>Original vs. Cloaked Token</h4>
                                        <div className={styles.tokenComparison}>
                                            <div className={styles.tokenColumn}>
                                                <h5>Original Token</h5>
                                                <pre>
                                                    {JSON.stringify(
                                                        cloakData.originalToken
                                                            .claims,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                            <div className={styles.tokenColumn}>
                                                <h5>Cloaked Token</h5>
                                                <pre>
                                                    {JSON.stringify(
                                                        cloakData.cloakedToken
                                                            .claims,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
