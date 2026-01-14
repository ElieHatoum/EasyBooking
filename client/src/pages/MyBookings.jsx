import { useEffect, useState } from "react";
import api from "../api";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/bookings/my-bookings");
                setBookings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleDelete = async (bookingId) => {
        if (
            !window.confirm("Are you sure you want to cancel this reservation?")
        ) {
            return;
        }
        try {
            await api.delete(`/bookings/${bookingId}`);
            setBookings((prevBookings) =>
                prevBookings.filter((b) => b._id !== bookingId)
            );
        } catch {
            alert("Failed to cancel booking. Please try again.");
        }
    };

    // --- Helpers ---
    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const now = new Date();
    const upcomingBookings = bookings.filter((b) => new Date(b.endTime) >= now);
    const pastBookings = bookings.filter((b) => new Date(b.endTime) < now);

    if (loading)
        return (
            <div style={styles.loadingContainer}>Loading reservations...</div>
        );

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h2 style={styles.pageTitle}>My Reservations</h2>

                {/* --- UPCOMING SECTION --- */}
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>Upcoming</h3>
                    <span style={styles.badge}>
                        {upcomingBookings.length} Active
                    </span>
                </div>

                {upcomingBookings.length === 0 ? (
                    <div style={styles.emptyState}>
                        No upcoming bookings found. Time to book a room!
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {upcomingBookings.map((b) => (
                            <div
                                key={b._id}
                                style={{ ...styles.card, ...styles.cardActive }}
                            >
                                {/* Status Strip -*/}
                                <div style={styles.statusStripActive}></div>

                                <div style={styles.cardContent}>
                                    <div style={styles.cardHeader}>
                                        <span style={styles.roomName}>
                                            {b.room
                                                ? b.room.name
                                                : "Unknown Room"}
                                        </span>
                                        <span style={styles.statusTextActive}>
                                            Confirmed
                                        </span>
                                    </div>

                                    <div style={styles.details}>
                                        <div style={styles.detailRow}>
                                            <span>📅</span>{" "}
                                            <span>
                                                {formatDate(b.startTime)}
                                            </span>
                                        </div>
                                        <div style={styles.detailRow}>
                                            <span>⏰</span>{" "}
                                            <span>
                                                {formatTime(b.startTime)} -{" "}
                                                {formatTime(b.endTime)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(b._id)}
                                        style={styles.cancelBtn}
                                    >
                                        Cancel Reservation
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- HISTORY SECTION --- */}
                <div style={{ ...styles.sectionHeader, marginTop: "40px" }}>
                    <h3 style={{ ...styles.sectionTitle, color: "#6c757d" }}>
                        History
                    </h3>
                </div>

                {pastBookings.length === 0 ? (
                    <div style={styles.emptyState}>No past history.</div>
                ) : (
                    <div style={styles.grid}>
                        {pastBookings.map((b) => (
                            <div
                                key={b._id}
                                style={{ ...styles.card, ...styles.cardPast }}
                            >
                                <div style={styles.statusStripPast}></div>
                                <div style={styles.cardContent}>
                                    <div style={styles.cardHeader}>
                                        <span
                                            style={{
                                                ...styles.roomName,
                                                color: "#666",
                                            }}
                                        >
                                            {b.room
                                                ? b.room.name
                                                : "Unknown Room"}
                                        </span>
                                        <span style={styles.statusTextPast}>
                                            Completed
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            ...styles.details,
                                            color: "#888",
                                        }}
                                    >
                                        <div style={styles.detailRow}>
                                            <span>📅</span>{" "}
                                            <span>
                                                {formatDate(b.startTime)}
                                            </span>
                                        </div>
                                        <div style={styles.detailRow}>
                                            <span>⏰</span>{" "}
                                            <span>
                                                {formatTime(b.startTime)} -{" "}
                                                {formatTime(b.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    contentWrapper: {
        maxWidth: "800px",
        margin: "0 auto",
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        paddingTop: "50px",
        fontSize: "18px",
        color: "#666",
    },
    pageTitle: {
        fontSize: "28px",
        color: "#1a1a1a",
        marginBottom: "30px",
        fontWeight: "700",
    },
    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "15px",
        borderBottom: "1px solid #e0e0e0",
        paddingBottom: "10px",
    },
    sectionTitle: {
        fontSize: "20px",
        margin: 0,
        color: "#333",
    },
    badge: {
        backgroundColor: "#e6f4ea",
        color: "#1e7e34",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
    },
    grid: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    emptyState: {
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        color: "#666",
        textAlign: "center",
        border: "1px dashed #ccc",
    },
    // --- CARD STYLES ---
    card: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        overflow: "hidden",
        transition: "transform 0.2s",
    },
    cardActive: {
        border: "1px solid #e0e0e0",
    },
    cardPast: {
        backgroundColor: "#f9f9f9",
        border: "1px solid #eee",
    },
    statusStripActive: {
        width: "6px",
        backgroundColor: "#28a745",
    },
    statusStripPast: {
        width: "6px",
        backgroundColor: "#adb5bd",
    },
    cardContent: {
        flex: 1,
        padding: "20px",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
    },
    roomName: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#007bff",
    },
    statusTextActive: {
        fontSize: "12px",
        color: "#28a745",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    statusTextPast: {
        fontSize: "12px",
        color: "#adb5bd",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    details: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        color: "#555",
        fontSize: "14px",
    },
    detailRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    cancelBtn: {
        marginTop: "15px",
        padding: "8px 16px",
        backgroundColor: "#fff",
        color: "#dc3545",
        border: "1px solid #dc3545",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        float: "right",
        transition: "background-color 0.2s",
    },
};

export default MyBookings;
