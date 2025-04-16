import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Admin.module.css";
import usersData from "../../data/users.json";
import settingsData from "../../data/settings.json";

const Admin = () => {
    const [users, setUsers] = useState(null);
    const [settings, setSettings] = useState(null);
    const [usersMessage, setUsersMessage] = useState("");
    const [settingsMessage, setSettingsMessage] = useState("");

    const fetchUsers = async (method) => {
        try {
            setUsersMessage(`Checking authorization for ${method}...`);
            if (method === "GET") {
                setUsers(null);
            }

            const endpoint = "https://localhost:3000/university/admin/users";

            // Get token from localStorage
            const token = localStorage.getItem("a3s_access_token");

            if (!token) {
                setUsersMessage("Error: No authentication token found");
                return;
            }

            const options = {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            };

            // Add body for POST and DELETE requests
            if (method === "POST") {
                options.body = JSON.stringify({
                    name: "Test User",
                    email: "test@example.com",
                });
            } else if (method === "DELETE") {
                options.body = JSON.stringify({ userId: "123" });
            }

            console.log(`Sending ${method} request to:`, endpoint);
            const response = await fetch(endpoint, options);

            if (response.ok) {
                const data = await response.json();
                setUsersMessage(data.message || "Request successful");

                if (method === "GET") {
                    setUsers(usersData); // Using mock data for display
                }
            } else {
                const error = await response.json();
                setUsersMessage(
                    `Access Denied: ${error.error || "Not authorized"}`
                );
            }
        } catch (error) {
            console.error("Request error:", error);
            setUsersMessage(`Error: ${error.message}`);

            if (method === "GET") {
                setUsers(usersData);
            }
        }
    };

    const fetchSettings = async () => {
        try {
            setSettingsMessage("Fetching settings...");
            setSettings(null);

            const endpoint = "https://localhost:3000/university/admin/settings";

            // Get token from localStorage
            const token = localStorage.getItem("a3s_access_token");

            if (!token) {
                setSettingsMessage("Error: No authentication token found");
                return;
            }

            console.log("Sending GET request to:", endpoint);
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setSettingsMessage(
                    data.message || "Settings fetched successfully"
                );
                setSettings(settingsData); // Using mock data for display
            } else {
                const error = await response.json();
                setSettingsMessage(
                    `Access Denied: ${error.error || "Not authorized"}`
                );
            }
        } catch (error) {
            console.error("Request error:", error);
            setSettingsMessage(`Error: ${error.message}`);
            setSettings(settingsData);
        }
    };

    return (
        <div className={styles.adminContainer}>
            <Navbar />
            <main className={styles.content}>
                <div className={styles.header}>
                    <h1>Admin Dashboard</h1>
                    <p>Manage users and system settings</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Users Management</h2>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.getButton}
                                onClick={() => fetchUsers("GET")}
                            >
                                GET Users
                            </button>
                            <button
                                className={styles.createButton}
                                onClick={() => fetchUsers("POST")}
                            >
                                POST User
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => fetchUsers("DELETE")}
                            >
                                DELETE User
                            </button>
                        </div>
                    </div>

                    {usersMessage && (
                        <div
                            className={`${styles.message} ${
                                usersMessage.includes("Denied") ||
                                usersMessage.includes("Error")
                                    ? styles.error
                                    : styles.success
                            }`}
                        >
                            <p>{usersMessage}</p>
                        </div>
                    )}

                    {users && (
                        <div className={styles.dataTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>System Settings</h2>
                        <button
                            className={styles.getButton}
                            onClick={fetchSettings}
                        >
                            GET Settings
                        </button>
                    </div>

                    {settingsMessage && (
                        <div
                            className={`${styles.message} ${
                                settingsMessage.includes("Denied") ||
                                settingsMessage.includes("Error")
                                    ? styles.error
                                    : styles.success
                            }`}
                        >
                            <p>{settingsMessage}</p>
                        </div>
                    )}

                    {settings && (
                        <div className={styles.settingsGrid}>
                            {settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className={styles.settingCard}
                                >
                                    <div className={styles.settingHeader}>
                                        <h3>{setting.name}</h3>
                                        <span className={styles.settingValue}>
                                            {setting.value}
                                        </span>
                                    </div>
                                    <p className={styles.settingDescription}>
                                        {setting.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
