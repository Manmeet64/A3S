import React, { useState } from "react";
import styles from "./Login.module.css";

const Login = () => {
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
                setResponse(data);
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
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome,</h1>
                        <h2 className={styles.subtitle}>
                            Discover Auth As A Service
                        </h2>
                        <p className={styles.description}>
                            Hey, welcome to your authentication solution
                        </p>
                    </div>

                    <div className={styles.form}>
                        <button className={styles.button} onClick={issueToken}>
                            Sign In with Google OIDC
                        </button>

                        {error && (
                            <div className={styles.error}>
                                <p>Error: {error}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.image}>
                    {/* Image is added via CSS */}
                </div>
            </div>
        </div>
    );
};

export default Login;
