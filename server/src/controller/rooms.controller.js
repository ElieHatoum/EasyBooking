const roomService = require("../services/rooms.service");

// @route   GET /api/rooms
const getRooms = async (req, res) => {
    try {
        const { capacity } = req.query;
        const rooms = await roomService.getAllRooms(capacity);
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

// @route   GET /api/:roomId/availability
const getRoomAvailability = async (req, res) => {
    try {
        const roomId = req.params.id;
        const date = req.query.date;

        const slots = await roomService.getRoomAvailability(roomId, date);
        res.json({ roomId, availableSlots: slots });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @route   POST /api/rooms/seed
const seedDatabase = async (req, res) => {
    try {
        await roomService.seedRooms();
        res.status(201).json({ msg: "Rooms added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    getRooms,
    getRoomAvailability,
    seedDatabase,
};
