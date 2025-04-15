import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const [token, setToken] = useState(null);
    const [decodedToken, setDecodedToken] = useState(null);
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

        // Decode token (this is a simple decode for JWT format)
        try {
            const base64Url = storedToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
            );

            setDecodedToken(JSON.parse(jsonPayload));
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("a3s_access_token");
        localStorage.removeItem("a3s_id_token");
        navigate("/login");
    };

    return (
        <div className={styles.dashboardContainer}>
            <Navbar />
            <main className={styles.content}>
                <div className={styles.header}>
                    <h1>Auth As A Service Dashboard</h1>
                    <p>Manage your authentication and authorization</p>
                </div>

                <div className={styles.authorizationSection}>
                    <h2>Authorization Levels</h2>

                    <div className={styles.authCards}>
                        <div className={styles.authCard}>
                            <h3>Admin Access</h3>
                            <ul className={styles.permissionList}>
                                <li>Access Admin page</li>
                                <li>GET access to Users data</li>
                                <li>GET access to Settings data</li>
                                <li>GET access to Resources data</li>
                                <li>Read-only mode for sensitive operations</li>
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
                    <h2>Token Management</h2>
                    <div className={styles.tokenCard}>
                        <div className={styles.tokenInfo}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Issuer:</span>
                                <span className={styles.value}>
                                    {decodedToken?.iss || "N/A"}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Subject:</span>
                                <span className={styles.value}>
                                    {decodedToken?.sub || "N/A"}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Issued At:</span>
                                <span className={styles.value}>
                                    {decodedToken?.iat
                                        ? new Date(
                                              decodedToken.iat * 1000
                                          ).toLocaleString()
                                        : "N/A"}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Expires:</span>
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
                                    ? JSON.stringify(decodedToken, null, 2)
                                    : "No token data available"}
                            </pre>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={styles.logoutBtn}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
