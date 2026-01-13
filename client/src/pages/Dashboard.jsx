import { useEffect, useState } from "react";
import api from "../api";

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [minCapacity, setMinCapacity] = useState("");
    const [searchCapacity, setSearchCapacity] = useState("");

    const [bookingDate, setBookingDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [startHour, setStartHour] = useState("8");
    const [endHour, setEndHour] = useState("9");

    const businessHours = Array.from({ length: 11 }, (_, i) => i + 8);

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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchCapacity(minCapacity); // Commit the search
        }
    };

    const handleBlur = () => {
        setSearchCapacity(minCapacity); // Commit the search
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
            setSelectedRoom(null);
        } catch (err) {
            alert(err.response?.data?.msg || "Booking failed");
        }
    };

    const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>Available Rooms</h2>

                {/* --- Filter Input --- */}
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Min Capacity:
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 10"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        style={{ padding: "5px", width: "80px" }}
                    />
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px",
                    marginTop: "20px",
                }}
            >
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div
                            key={room._id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                borderRadius: "8px",
                            }}
                        >
                            <h3>{room.name}</h3>
                            <p>Capacity: {room.capacity}</p>
                            <button onClick={() => setSelectedRoom(room)}>
                                Select Room
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No rooms found with this capacity.</p>
                )}
            </div>

            {selectedRoom && (
                <div
                    style={{
                        marginTop: "20px",
                        border: "2px solid #007bff",
                        padding: "20px",
                        borderRadius: "8px",
                    }}
                >
                    <h3>Booking: {selectedRoom.name}</h3>

                    <div style={{ marginBottom: "20px" }}>
                        <label>
                            <strong>1. Select Date: </strong>
                        </label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            style={{ padding: "5px" }}
                        />
                    </div>

                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "5px",
                        }}
                    >
                        <strong>Available Slots (Hours):</strong>
                        {availableSlots.length > 0 ? (
                            <ul style={{ margin: "5px 0 0 20px" }}>
                                {availableSlots.map((slot, idx) => (
                                    <li key={idx} style={{ color: "green" }}>
                                        {new Date(slot.startTime).getHours()}:00
                                        - {new Date(slot.endTime).getHours()}:00
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: "red" }}>Fully booked.</p>
                        )}
                    </div>

                    <form
                        onSubmit={handleBook}
                        style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "end",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "5px",
                                }}
                            >
                                Start Time
                            </label>
                            <select
                                value={startHour}
                                onChange={(e) => {
                                    const newStart = e.target.value;
                                    setStartHour(newStart);
                                    if (
                                        parseInt(newStart) >= parseInt(endHour)
                                    ) {
                                        setEndHour(
                                            (parseInt(newStart) + 1).toString()
                                        );
                                    }
                                }}
                                style={{ padding: "8px", width: "100px" }}
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

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "5px",
                                }}
                            >
                                End Time
                            </label>
                            <select
                                value={endHour}
                                onChange={(e) => setEndHour(e.target.value)}
                                style={{ padding: "8px", width: "100px" }}
                            >
                                {businessHours.map((h) => (
                                    <option
                                        key={h}
                                        value={h}
                                        disabled={h <= parseInt(startHour)}
                                    >
                                        {formatHour(h)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Book Now
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
