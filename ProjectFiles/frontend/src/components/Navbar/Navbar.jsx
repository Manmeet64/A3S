import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { Home, Users, BookOpen, FileText, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <div className={styles.mobileToggle} onClick={toggleNavbar}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>

            <nav className={`${styles.navbar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.logo}>
                    <h2>Fingerr</h2>
                </div>

                <div className={styles.navLinks}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${
                            isActive("/") ? styles.active : ""
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
                    <button className={styles.logoutButton}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
