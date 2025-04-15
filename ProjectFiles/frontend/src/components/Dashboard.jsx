import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [message, setMessage] = useState("");
    const [token, setToken] = useState(null);
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
    }, [navigate]);

    const checkAccess = async (endpoint, params = {}) => {
        try {
            setMessage("Checking access...");

            // Build URL with query parameters
            const url = new URL(`https://localhost:3000${endpoint}`);
            Object.keys(params).forEach((key) =>
                url.searchParams.append(key, params[key])
            );

            // Make the request directly to the endpoint with the token in Authorization header
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include", // Include cookies in the request
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
            } else {
                const error = await response.json();
                setMessage(`Access Denied: ${error.error || "Not authorized"}`);
            }
        } catch (error) {
            console.error("Request error:", error);
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("a3s_access_token");
        localStorage.removeItem("a3s_id_token");
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <h1>University Portal Dashboard</h1>

            <div className="access-buttons">
                <button
                    onClick={() => checkAccess("/university/admin/users")}
                    className="admin-btn"
                >
                    Admin Access
                </button>

                <button
                    onClick={() => checkAccess("/university/students/grades")}
                    className="student-btn"
                >
                    Student Access
                </button>

                {/* Buttons with query parameters properly handled */}
                <button
                    onClick={() =>
                        checkAccess("/university/admin/users", { cloak: "hd" })
                    }
                    className="admin-cloak-btn"
                    style={{ backgroundColor: "#9c27b0", color: "white" }}
                >
                    Admin Cloak
                </button>

                <button
                    onClick={() =>
                        checkAccess("/university/admin/users", {
                            restrict: "get",
                        })
                    }
                    className="admin-restrict-btn"
                    style={{ backgroundColor: "#ff5722", color: "white" }}
                >
                    Admin Restrict
                </button>

                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>

            {message && (
                <div
                    className={`message-container ${
                        message.includes("Denied") || message.includes("Error")
                            ? "error"
                            : "success"
                    }`}
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "5px",
                        backgroundColor:
                            message.includes("Denied") ||
                            message.includes("Error")
                                ? "#ffebee"
                                : "#e8f5e9",
                        border:
                            message.includes("Denied") ||
                            message.includes("Error")
                                ? "1px solid #ef9a9a"
                                : "1px solid #a5d6a7",
                    }}
                >
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
