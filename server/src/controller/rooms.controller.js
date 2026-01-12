const roomService = require("../services/rooms.service");

// @route   GET /api/rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await roomService.getAllRooms();
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
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
    seedDatabase,
};
