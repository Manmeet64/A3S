import { useEffect, useState } from "react";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://localhost:3001/profile", {
                    credentials: "include", // Send session cookie
                });

                if (!response.ok) {
                    throw new Error("Not authorized");
                }

                const data = await response.json();
                setProfile(data.user);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div>
            <h2>User Profile</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {profile ? (
                <pre>{JSON.stringify(profile, null, 2)}</pre>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;
