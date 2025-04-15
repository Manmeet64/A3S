import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
    const navigate = useNavigate();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Log the full URL to debug
        console.log("Callback URL:", window.location.href);

        const params = new URLSearchParams(window.location.search);

        // Log all query parameters
        console.log("All query parameters:");
        for (const [key, value] of params.entries()) {
            console.log(`${key}: ${value}`);
        }

        const state = params.get("state");
        const code = params.get("code");
        const accessToken = params.get("access_token");
        const idToken = params.get("id_token");

        if (state && code) {
            console.log("State and code found, making /issue request ✅");
            issueToken(state, code);
        } else if (accessToken && idToken) {
            console.log("Access token and ID token found ✅");

            // Save tokens to localStorage
            localStorage.setItem("a3s_access_token", accessToken);
            localStorage.setItem("a3s_id_token", idToken);

            navigate("/dashboard");
        } else {
            console.warn(
                "Required parameters missing ❌ Redirecting to /login"
            );
            navigate("/login");
        }
    }, [navigate]);

    const issueToken = async (state, code) => {
        try {
            const res = await fetch("https://localhost:3000/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceType: "OIDC",
                    sourceNamespace: "/",
                    sourceName: "google-oidc-test",
                    inputOIDC: {
                        state: state,
                        code: code,
                    },
                    cookie: true,
                    cookieDomain: "localhost",
                    audience: ["public"],
                }),
                credentials: "include",
            });

            const data = await res.json();
            console.log("✅ Response from /issue:", data);
            setResponse(data);

            if (data.token) {
                console.log("Token received:", data.token);
                localStorage.setItem("a3s_access_token", data.token);
                setToken(data.token);
                navigate("/dashboard");
            } else {
                console.warn("No token in response");
                setError("Authentication failed - no token received");
            }
        } catch (error) {
            console.error("❌ /issue request error:", error);
            setError(error.message || "Failed to complete authentication");
        }
    };

    return (
        <div>
            <p>Completing authentication...</p>

            {token && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f0f0f0",
                    }}
                >
                    <h3>Authentication Token:</h3>
                    <p style={{ wordBreak: "break-all" }}>{token}</p>
                </div>
            )}

            {response && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        border: "1px solid #ccc",
                    }}
                >
                    <h3>Response:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div style={{ marginTop: "20px", color: "red" }}>
                    <p>Error: {error}</p>
                </div>
            )}
        </div>
    );
};

export default Callback;
