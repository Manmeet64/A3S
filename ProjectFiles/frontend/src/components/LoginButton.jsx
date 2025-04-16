import React, { useState } from "react";
import axios from "axios";

const LoginButton = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const issueToken = async () => {
        try {
            setError(null);

            const response = await fetch("https://localhost:3000/issue", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    sourceType: "OIDC",
                    sourceNamespace: "/",
                    sourceName: "google-oidc-test",
                    inputOIDC: {
                        redirectURL: "https://localhost:5173/callback",
                        redirectErrorURL: "https://localhost:5173/error",
                        noAuthRedirect: true,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Response from backend:", data);

            if (data.token) {
                console.log("Token received:", data.token);
            } else if (data.inputOIDC?.authURL) {
                console.log("Redirecting to:", data.inputOIDC.authURL);
                window.location.href = data.inputOIDC.authURL;
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Failed to initiate login");
        }
    };

    return (
        <div>
            <button onClick={issueToken}>Sign In with Google</button>

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

export default LoginButton;
