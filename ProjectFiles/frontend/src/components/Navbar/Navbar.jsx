import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { Home, Users, BookOpen, FileText, LogOut } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.removeItem("a3s_access_token");
        localStorage.removeItem("a3s_id_token");
        navigate("/");
    };

    // Don't render the mobile toggle at all for the docs page
    const showMobileToggle = location.pathname !== "/docs";

    return (
        <>
            {/* Completely removed the mobile toggle for docs page */}

            <nav className={`${styles.navbar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.logo}>
                    <h2>University</h2>
                </div>

                <div className={styles.navLinks}>
                    <Link
                        to="/dashboard"
                        className={`${styles.navLink} ${
                            isActive("/dashboard") || isActive("/")
                                ? styles.active
                                : ""
                        }`}
                    >
                        <Home size={20} />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/admin"
                        className={`${styles.navLink} ${
                            isActive("/admin") ? styles.active : ""
                        }`}
                    >
                        <Users size={20} />
                        <span>Admin</span>
                    </Link>

                    <Link
                        to="/resources"
                        className={`${styles.navLink} ${
                            isActive("/resources") ? styles.active : ""
                        }`}
                    >
                        <BookOpen size={20} />
                        <span>Resources</span>
                    </Link>

                    <Link
                        to="/docs"
                        className={`${styles.navLink} ${
                            isActive("/docs") ? styles.active : ""
                        }`}
                    >
                        <FileText size={20} />
                        <span>Docs</span>
                    </Link>
                </div>

                <div className={styles.navFooter}>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
