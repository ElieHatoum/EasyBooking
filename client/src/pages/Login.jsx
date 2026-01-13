import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post("/auth/login", formData);
            login(res.data);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.msg ||
                    "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>
                        Please enter your details to sign in.
                    </p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            required
                            style={styles.input}
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            style={styles.input}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        style={
                            isLoading
                                ? { ...styles.button, ...styles.buttonDisabled }
                                : styles.button
                        }
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" style={styles.link}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    header: {
        textAlign: "center",
        marginBottom: "30px",
    },
    title: {
        margin: "0 0 10px 0",
        color: "#1a1a1a",
        fontSize: "24px",
        fontWeight: "600",
    },
    subtitle: {
        margin: 0,
        color: "#65676b",
        fontSize: "14px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#333",
    },
    input: {
        padding: "12px 15px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    button: {
        padding: "14px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s",
        marginTop: "10px",
    },
    buttonDisabled: {
        backgroundColor: "#9ec5fe",
        cursor: "not-allowed",
    },
    errorBox: {
        backgroundColor: "#fde8e8",
        color: "#c53030",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "20px",
        fontSize: "14px",
        textAlign: "center",
        border: "1px solid #fbd5d5",
    },
    footer: {
        marginTop: "25px",
        textAlign: "center",
        fontSize: "14px",
        color: "#65676b",
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
        fontWeight: "600",
    },
};

export default Login;
