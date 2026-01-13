import { useEffect, useState } from "react";
import api from "../api";

const Dashboard = () => {
    // Data States
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Search States
    const [minCapacity, setMinCapacity] = useState("");
    const [searchCapacity, setSearchCapacity] = useState("");

    // Booking Form States
    const [bookingDate, setBookingDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [startHour, setStartHour] = useState("8");
    const [endHour, setEndHour] = useState("9");

    const businessHours = Array.from({ length: 11 }, (_, i) => i + 8);

    // Fetch Rooms on Search
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const url = searchCapacity
                    ? `/rooms?capacity=${searchCapacity}`
                    : "/rooms";
                const res = await api.get(url);
                setRooms(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRooms();
    }, [searchCapacity]);

    // Fetch Availability on Room/Date change
    useEffect(() => {
        if (selectedRoom) {
            const fetchAvailability = async () => {
                try {
                    const res = await api.get(
                        `/rooms/${selectedRoom._id}/availability?date=${bookingDate}`
                    );
                    setAvailableSlots(res.data.availableSlots);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchAvailability();
        }
    }, [selectedRoom, bookingDate]);

    // Handlers
    const handleKeyDown = (e) => {
        if (e.key === "Enter") setSearchCapacity(minCapacity);
    };

    const handleBlur = () => {
        setSearchCapacity(minCapacity);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        const start = new Date(bookingDate);
        start.setHours(parseInt(startHour), 0, 0, 0);

        const end = new Date(bookingDate);
        end.setHours(parseInt(endHour), 0, 0, 0);

        try {
            await api.post("/bookings", {
                roomId: selectedRoom._id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
            });
            alert("Room booked successfully!");
            setSelectedRoom(null); // Close modal
        } catch (err) {
            alert(err.response?.data?.msg || "Booking failed");
        }
    };

    const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;

    return (
        <div style={styles.container}>
            {/* --- HEADER SECTION --- */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Find a Room</h2>
                </div>

                {/* Search Bar */}
                <div style={styles.searchContainer}>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                        Min Capacity:
                    </span>
                    <input
                        type="number"
                        placeholder="e.g. 10"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {/* --- ROOM GRID --- */}
            <div style={styles.grid}>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div key={room._id} style={styles.roomCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.roomName}>{room.name}</h3>
                            </div>

                            <div style={styles.cardBody}>
                                <p style={styles.capacityBadge}>
                                    Capacity: {room.capacity}
                                </p>
                                <button
                                    onClick={() => setSelectedRoom(room)}
                                    style={styles.bookButton}
                                >
                                    Book Room
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <p>No rooms found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL: BOOKING FORM --- */}
            {selectedRoom && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>
                                Booking: {selectedRoom.name}
                            </h3>
                            <button
                                onClick={() => setSelectedRoom(null)}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            {/* Date Picker */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Select Date</label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) =>
                                        setBookingDate(e.target.value)
                                    }
                                    style={styles.input}
                                />
                            </div>

                            {/* Availability Display */}
                            <div style={styles.availabilityBox}>
                                <strong
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                    }}
                                >
                                    Available Slots on{" "}
                                    {new Date(bookingDate).toLocaleDateString()}
                                    :
                                </strong>
                                {availableSlots.length > 0 ? (
                                    <div style={styles.slotsGrid}>
                                        {availableSlots.map((slot, idx) => (
                                            <span
                                                key={idx}
                                                style={styles.slotBadge}
                                            >
                                                {new Date(
                                                    slot.startTime
                                                ).getHours()}
                                                :00 -{" "}
                                                {new Date(
                                                    slot.endTime
                                                ).getHours()}
                                                :00
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            color: "#dc3545",
                                            margin: 0,
                                            fontSize: "14px",
                                        }}
                                    >
                                        ⚠️ Fully booked for this date.
                                    </p>
                                )}
                            </div>

                            {/* Time Selection Form */}
                            <form onSubmit={handleBook} style={styles.timeForm}>
                                <div style={{ display: "flex", gap: "15px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>
                                            Start Time
                                        </label>
                                        <select
                                            value={startHour}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setStartHour(val);
                                                if (
                                                    parseInt(val) >=
                                                    parseInt(endHour)
                                                ) {
                                                    setEndHour(
                                                        (
                                                            parseInt(val) + 1
                                                        ).toString()
                                                    );
                                                }
                                            }}
                                            style={styles.select}
                                        >
                                            {businessHours.map((h) => (
                                                <option
                                                    key={h}
                                                    value={h}
                                                    disabled={h === 18}
                                                >
                                                    {formatHour(h)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>
                                            End Time
                                        </label>
                                        <select
                                            value={endHour}
                                            onChange={(e) =>
                                                setEndHour(e.target.value)
                                            }
                                            style={styles.select}
                                        >
                                            {businessHours.map((h) => (
                                                <option
                                                    key={h}
                                                    value={h}
                                                    disabled={
                                                        h <= parseInt(startHour)
                                                    }
                                                >
                                                    {formatHour(h)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    style={styles.confirmButton}
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "40px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px",
    },
    title: {
        margin: "0 0 5px 0",
        color: "#1a1a1a",
        fontSize: "28px",
    },
    subtitle: {
        margin: 0,
        color: "#666",
        fontSize: "14px",
    },
    searchContainer: {
        backgroundColor: "white",
        padding: "10px 15px",
        borderRadius: "30px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    searchInput: {
        border: "none",
        outline: "none",
        fontSize: "16px",
        width: "80px",
        fontWeight: "bold",
        color: "#007bff",
    },
    // --- GRID & CARDS ---
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "25px",
    },
    roomCard: {
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
    },
    cardHeader: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    roomIcon: {
        fontSize: "24px",
        backgroundColor: "#e7f1ff",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
    },
    roomName: {
        margin: 0,
        fontSize: "18px",
        color: "#333",
    },
    cardBody: {
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    capacityBadge: {
        margin: 0,
        fontSize: "14px",
        color: "#555",
        backgroundColor: "#f0f2f5",
        padding: "5px 10px",
        borderRadius: "5px",
        alignSelf: "start",
    },
    bookButton: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    emptyState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        color: "#888",
        padding: "40px",
    },
    // --- MODAL STYLES ---
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "500px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-out",
    },
    modalHeader: {
        padding: "20px",
        borderBottom: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        color: "#666",
    },
    modalBody: {
        padding: "20px",
    },
    formGroup: {
        marginBottom: "20px",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#444",
        textTransform: "uppercase",
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "15px",
        boxSizing: "border-box",
    },
    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "15px",
        backgroundColor: "white",
        boxSizing: "border-box",
    },
    availabilityBox: {
        backgroundColor: "#f0f8ff",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #cce5ff",
        marginBottom: "20px",
    },
    slotsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
    },
    slotBadge: {
        backgroundColor: "white",
        color: "#007bff",
        border: "1px solid #b8daff",
        padding: "5px 10px",
        borderRadius: "15px",
        fontSize: "12px",
        fontWeight: "600",
    },
    timeForm: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    confirmButton: {
        padding: "14px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "10px",
    },
};

export default Dashboard;
