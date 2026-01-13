import { useEffect, useState } from "react";
import api from "../api";

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/bookings/my-bookings");
                setBookings(res.data);
            } catch (err) {
                console.error("Erreur historique:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Fonction utilitaire pour formater la date
    const formatDate = (isoString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(isoString).toLocaleDateString("fr-FR", options);
    };

    // Fonction utilitaire pour formater l'heure (HH:MM)
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Séparer les réservations Passées et Futures
    const now = new Date();
    const upcomingBookings = bookings.filter((b) => new Date(b.endTime) >= now);
    const pastBookings = bookings.filter((b) => new Date(b.endTime) < now);

    if (loading) return <p>Chargement de l'historique...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>Historique de mes réservations</h2>

            {bookings.length === 0 ? (
                <p>Aucune réservation trouvée.</p>
            ) : (
                <>
                    {/* --- SECTION À VENIR --- */}
                    <h3 style={{ color: "#28a745" }}>📅 À venir</h3>
                    {upcomingBookings.length > 0 ? (
                        <div style={gridStyle}>
                            {upcomingBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    formatDate={formatDate}
                                    formatTime={formatTime}
                                    isPast={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Aucune réservation prévue.</p>
                    )}

                    <hr style={{ margin: "30px 0" }} />

                    {/* --- SECTION PASSÉES --- */}
                    <h3 style={{ color: "#6c757d" }}>archivées / Passées</h3>
                    {pastBookings.length > 0 ? (
                        <div style={gridStyle}>
                            {pastBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    formatDate={formatDate}
                                    formatTime={formatTime}
                                    isPast={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Aucun historique.</p>
                    )}
                </>
            )}
        </div>
    );
};

// Sous-composant pour afficher une carte de réservation
const BookingCard = ({ booking, formatDate, formatTime, isPast }) => {
    // Si la salle a été supprimée de la BDD, booking.room peut être null
    const roomName = booking.room
        ? booking.room.name
        : "Salle inconnue (supprimée)";

    return (
        <div
            style={{
                border: isPast ? "1px solid #ddd" : "2px solid #007bff",
                backgroundColor: isPast ? "#f9f9f9" : "#fff",
                padding: "15px",
                borderRadius: "8px",
                opacity: isPast ? 0.8 : 1,
            }}
        >
            <h4 style={{ margin: "0 0 10px 0" }}>{roomName}</h4>
            <p style={{ margin: "5px 0" }}>
                <strong>Date :</strong> {formatDate(booking.startTime)}
            </p>
            <p style={{ margin: "5px 0" }}>
                <strong>Créneau :</strong> {formatTime(booking.startTime)} -{" "}
                {formatTime(booking.endTime)}
            </p>
            {isPast && (
                <span style={{ fontSize: "0.8em", color: "gray" }}>
                    Terminée
                </span>
            )}
        </div>
    );
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px",
};

export default BookingHistory;
