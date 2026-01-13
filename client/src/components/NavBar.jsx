import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={styles.navbar}>
            {/* Logo Section */}
            <Link to="/" style={styles.logo}>
                EasyBooking
            </Link>

            {/* Navigation Links Section */}
            <div style={styles.navLinks}>
                {user ? (
                    <>
                        <Link to="/" style={styles.link}>
                            Rooms
                        </Link>

                        <Link to="/my-bookings" style={styles.link}>
                            My Bookings
                        </Link>

                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>
                            Login
                        </Link>
                        <Link to="/register" style={styles.primaryBtn}>
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 40px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    logo: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#007bff",
        textDecoration: "none",
        letterSpacing: "-0.5px",
    },
    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "25px",
    },
    link: {
        textDecoration: "none",
        color: "#555",
        fontWeight: "500",
        fontSize: "16px",
        transition: "color 0.2s",
    },
    welcomeText: {
        color: "#888",
        fontSize: "14px",
        marginRight: "10px",
        borderRight: "1px solid #ddd",
        paddingRight: "20px",
    },
    primaryBtn: {
        textDecoration: "none",
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 20px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "14px",
        transition: "background-color 0.2s",
    },
    logoutBtn: {
        backgroundColor: "transparent",
        color: "#dc3545",
        border: "1px solid #dc3545",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s",
    },
};

export default Navbar;
