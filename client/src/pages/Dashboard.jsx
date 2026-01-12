import { useEffect, useState } from "react";
import api from "../api";

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [bookingData, setBookingData] = useState({
        startTime: "",
        endTime: "",
    });
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get("/rooms");
                setRooms(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRooms();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post("/bookings", {
                roomId: selectedRoom._id,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
            });
            alert("Room booked successfully!");
            setBookingData({ startTime: "", endTime: "" });
            setSelectedRoom(null);
        } catch (err) {
            alert(err.response?.data?.msg || "Booking failed");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Available Rooms</h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px",
                }}
            >
                {rooms.map((room) => (
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
                            Book This Room
                        </button>
                    </div>
                ))}
            </div>

            {selectedRoom && (
                <div
                    style={{
                        marginTop: "20px",
                        border: "2px solid #007bff",
                        padding: "20px",
                    }}
                >
                    <h3>Booking {selectedRoom.name}</h3>
                    <form onSubmit={handleBook}>
                        <label>Start: </label>
                        <input
                            type="datetime-local"
                            required
                            value={bookingData.startTime}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    startTime: e.target.value,
                                })
                            }
                        />
                        <br />
                        <br />
                        <label>End: </label>
                        <input
                            type="datetime-local"
                            required
                            value={bookingData.endTime}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    endTime: e.target.value,
                                })
                            }
                        />
                        <br />
                        <br />
                        <button type="submit">Confirm</button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoom(null)}
                            style={{ marginLeft: "10px" }}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
