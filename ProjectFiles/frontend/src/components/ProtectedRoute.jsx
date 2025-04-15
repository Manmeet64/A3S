// src/components/AuthCallback.js
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const AuthCallback = () => {
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token"); // Capture the token from the URL

        if (token) {
            localStorage.setItem("access_token", token); // Store the token in localStorage
            history.push("/"); // Redirect to home or dashboard after login
        }
    }, [history]);

    return (
        <div>
            <h2>Logging you in...</h2>
        </div>
    );
};

export default AuthCallback;
