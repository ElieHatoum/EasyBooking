import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.post("/auth/register", formData);
            alert("Account created successfully! Please login.");
            navigate("/login");
        } catch (err) {
            if (err.response?.data?.data?.errors) {
                const validationErrors = err.response.data.data.errors;

                const firstField = Object.keys(validationErrors)[0];
                const firstErrorMessage = validationErrors[firstField][0];

                setError(firstErrorMessage);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Error registering. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Create an Account</h2>
                    <p style={styles.subtitle}>
                        Join us to start booking rooms today.
                    </p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Username Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name / Username</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            required
                            style={styles.input}
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Email Field */}
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

                    {/* Password Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Create a strong password"
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
                        {isLoading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" style={styles.link}>
                            Log in
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
        backgroundColor: "#28a745",
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
        backgroundColor: "#94d3a2",
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

export default Register;
