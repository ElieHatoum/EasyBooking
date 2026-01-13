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
            alert("Booking cancelled successfully.");
        } catch (err) {
            console.error("Failed to delete booking:", err);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
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
        return <p style={{ padding: "20px" }}>Loading reservations...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>My Reservations</h2>

            {/* --- UPCOMING --- */}
            <h3
                style={{
                    color: "#28a745",
                    borderBottom: "2px solid #28a745",
                    paddingBottom: "5px",
                }}
            >
                Upcoming
            </h3>

            {upcomingBookings.length === 0 ? (
                <p>No upcoming bookings.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {upcomingBookings.map((b) => (
                        <li key={b._id} style={cardStyle}>
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: "1.1em" }}>
                                    {b.room ? b.room.name : "Unknown Room"}
                                </strong>
                                <div
                                    style={{ color: "#555", marginTop: "5px" }}
                                >
                                    📅 {formatDate(b.startTime)}
                                </div>
                                <div style={{ color: "#555" }}>
                                    ⏰ {formatTime(b.startTime)} -{" "}
                                    {formatTime(b.endTime)}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(b._id)}
                                style={cancelButtonStyle}
                            >
                                Cancel
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* --- HISTORY --- */}
            <h3
                style={{
                    color: "#666",
                    borderBottom: "2px solid #ccc",
                    paddingBottom: "5px",
                    marginTop: "40px",
                }}
            >
                History
            </h3>

            {pastBookings.length === 0 ? (
                <p>No past history.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {pastBookings.map((b) => (
                        <li
                            key={b._id}
                            style={{
                                ...cardStyle,
                                backgroundColor: "#f9f9f9",
                                borderColor: "#ddd",
                            }}
                        >
                            <div style={{ flex: 1, opacity: 0.7 }}>
                                <strong>
                                    {b.room ? b.room.name : "Unknown Room"}
                                </strong>
                                <div style={{ fontSize: "0.9em" }}>
                                    {formatDate(b.startTime)} <br />
                                    {formatTime(b.startTime)} -{" "}
                                    {formatTime(b.endTime)}
                                </div>
                            </div>
                            <span
                                style={{
                                    fontSize: "0.8em",
                                    color: "#888",
                                    fontStyle: "italic",
                                }}
                            >
                                Completed
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const cardStyle = {
    marginBottom: "15px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const cancelButtonStyle = {
    padding: "8px 15px",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
};

export default MyBookings;
