const Booking = require("../models/booking.model");

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
    return await Booking.find({ user: userId }).populate("room", [
        "name",
        "capacity",
    ]);
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
