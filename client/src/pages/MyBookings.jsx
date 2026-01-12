import { useEffect, useState } from "react";
import api from "../api";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/bookings/my-bookings");
                setBookings(res.data);
            } catch (err) {
                console.error(err);
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

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Reservations</h2>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <ul>
                    {bookings.map((b) => (
                        <li
                            key={b._id}
                            style={{
                                marginBottom: "10px",
                                padding: "10px",
                                border: "1px solid #eee",
                                listStyle: "none",
                                borderRadius: "5px",
                            }}
                        >
                            <strong>{b.room.name}</strong> <br />
                            From: {new Date(b.startTime).toLocaleString()}{" "}
                            <br />
                            To: {new Date(b.endTime).toLocaleString()}
                            <br />
                            <button
                                onClick={() => handleDelete(b._id)}
                                style={{
                                    marginTop: "10px",
                                    padding: "5px 10px",
                                    backgroundColor: "#ff4d4f",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel Booking
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyBookings;
