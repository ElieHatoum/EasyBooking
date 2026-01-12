const Room = require("../models/room.model");

// Get all rooms from DB
const getAllRooms = async () => {
    try {
        const rooms = await Room.find();
        return rooms;
    } catch (error) {
        throw error;
    }
};

// Seed the DB with initial data
const seedRooms = async () => {
    try {
        const roomsToSeed = [
            { name: "Conference A", capacity: 10 },
            { name: "Meeting B", capacity: 4 },
        ];
        // insertMany returns the documents inserted
        return await Room.insertMany(roomsToSeed);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllRooms,
    seedRooms,
};
