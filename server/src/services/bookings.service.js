const Booking = require("../models/booking.model");

const isHourly = (dateString) => {
    const date = new Date(dateString);
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    // Minutes and Seconds must be 0
    return minutes === 0 && seconds === 0;
};

const isWithinBusinessHours = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const startHour = start.getHours();
    const endHour = end.getHours();

    // Check if start is too early (before 8:00)
    if (startHour < 8) return false;

    // Check if end is too late (after 18:00)
    if (endHour > 18) return false;

    // Check if start is too late
    if (startHour >= 18) return false;

    return true;
};

/**
 * Creates a new booking if no conflict exists
 */
const createBooking = async (userId, roomId, startTime, endTime) => {
    const now = new Date();

    // startTime must be in the future
    if (new Date(startTime) <= now) {
        const error = new Error("Cannot book a room in the past");
        error.statusCode = 400;
        throw error;
    }

    // endTime must be after startTime
    if (new Date(endTime) <= new Date(startTime)) {
        const error = new Error("End time must be after start time");
        error.statusCode = 400;
        throw error;
    }

    if (!isHourly(startTime) || !isHourly(endTime)) {
        const error = new Error(
            "Bookings must be for full hours only (e.g., 10:00, 11:00)."
        );
        error.statusCode = 400;
        throw error;
    }

    if (!isWithinBusinessHours(startTime, endTime)) {
        const error = new Error(
            "Bookings are only allowed between 08:00 and 18:00."
        );
        error.statusCode = 400;
        throw error;
    }

    // Check for overlapping bookings
    const conflict = await Booking.findOne({
        room: roomId,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });

    if (conflict) {
        const error = new Error("ROOM_OCCUPIED");
        error.statusCode = 409;
        throw error;
    }

    const newBooking = new Booking({
        userId: userId,
        room: roomId,
        startTime,
        endTime,
    });

    return await newBooking.save();
};

/**
 * Retrieves bookings for a specific user and populates room details
 */
const getUserBookings = async (userId) => {
    return await Booking.find({ user: userId })
        .populate("room", ["name", "capacity"])
        .sort({ startTime: -1 }); // most recent first
};

const deleteBooking = async (userId, bookingId) => {
    const deletedBooking = await Booking.findOneAndDelete({
        _id: bookingId,
        userId: userId,
    });

    if (!deletedBooking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
        throw error;
    }

    return deletedBooking;
};

module.exports = {
    createBooking,
    deleteBooking,
    getUserBookings,
};
