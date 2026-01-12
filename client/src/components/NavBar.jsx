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
        <nav
            style={{
                padding: "1rem",
                borderBottom: "1px solid #ccc",
                display: "flex",
                gap: "20px",
            }}
        >
            <Link to="/" style={{ fontWeight: "bold", textDecoration: "none" }}>
                EasyBooking
            </Link>

            {user ? (
                <>
                    <Link to="/">Rooms</Link>
                    <Link to="/my-bookings">My Bookings</Link>
                    <button
                        onClick={handleLogout}
                        style={{ marginLeft: "auto" }}
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login" style={{ marginLeft: "auto" }}>
                        Login
                    </Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
