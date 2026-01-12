const bookingService = require("../services/bookings.service");

// @route   POST /api/bookings
const createBooking = async (req, res) => {
    const { roomId, startTime, endTime } = req.body;
    const userId = req.user.userId;

    try {
        const booking = await bookingService.createBooking(
            userId,
            roomId,
            startTime,
            endTime
        );
        res.status(201).json(booking);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const message = err.message || "Server error";

        console.error(err.message);
        res.status(statusCode).json({ msg: message });
    }
};

// @route   DELETE /api/bookings/:bookingId
const deleteBooking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookingId = req.params.bookingId;

        const deletedBooking = await bookingService.deleteBooking(
            userId,
            bookingId
        );

        return res.status(200).json({
            success: true,
            message: "Booking deleted",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).send({
            success: false,
            message: error.message,
        });
    }
};

// @route   GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
    const userId = req.userId;

    try {
        const bookings = await bookingService.getUserBookings(userId);
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    createBooking,
    deleteBooking,
    getMyBookings,
};
