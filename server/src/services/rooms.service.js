const Room = require("../models/room.model");
const Booking = require("../models/booking.model");

// Get all rooms from DB
const getAllRooms = async (capacity) => {
    try {
        let query = {};
        if (capacity) {
            // Find rooms strictly bigger or equal to the requested capacity
            query.capacity = { $gte: parseInt(capacity) };
        }
        const rooms = await Room.find(query);

        return rooms;
    } catch (error) {
        throw error;
    }
};

// Calculate availability for a SINGLE room
const getRoomAvailability = async (roomId, queryDate) => {
    try {
        // Define the bounds of the Day (08:00 to 18:00)
        // Parse the date string in local timezone to avoid UTC offset issues
        const [year, month, day] = queryDate.split("-").map(Number);
        const dayStart = new Date(year, month - 1, day, 8, 0, 0, 0);

        const dayEnd = new Date(year, month - 1, day, 18, 0, 0, 0);

        // Fetch bookings ONLY for this specific room and date
        const bookings = await Booking.find({
            room: roomId,
            startTime: { $gte: dayStart },
            endTime: { $lte: dayEnd },
        }).sort({ startTime: 1 });

        // Calculate the gaps
        const availableSlots = [];
        let currentTime = dayStart;

        bookings.forEach((booking) => {
            // If there is a gap between cursor and booking start
            if (currentTime < booking.startTime) {
                availableSlots.push({
                    startTime: currentTime,
                    endTime: booking.startTime,
                });
            }
            // Move cursor to end of booking
            if (booking.endTime > currentTime) {
                currentTime = booking.endTime;
            }
        });

        // Check for time remaining after the last booking
        if (currentTime < dayEnd) {
            availableSlots.push({
                startTime: currentTime,
                endTime: dayEnd,
            });
        }

        return availableSlots;
    } catch (error) {
        throw error;
    }
};

// Seed the DB with initial data
const seedRooms = async () => {
    try {
        const roomsToSeed = [
            { name: "Salle A201", capacity: 10 },
            { name: "Salle A105", capacity: 5 },
            { name: "Salle B410", capacity: 10 },
            { name: "Amphi A", capacity: 50 },
        ];
        return await Room.insertMany(roomsToSeed);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllRooms,
    getRoomAvailability,
    seedRooms,
};
