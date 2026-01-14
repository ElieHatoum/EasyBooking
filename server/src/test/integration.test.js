const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../server"); // Ensure this exports 'app' without listening
const User = require("../models/user.model");
const Room = require("../models/room.model");

let mongoServer;

// --- SETUP ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

describe("EasyBooking API Integration Tests", () => {
    let authToken = "";
    let userId = "";
    let roomId = "";

    // --- Register and Login ---
    const setupUser = async () => {
        const userData = {
            username: "TestUser",
            email: "test@example.com",
            password: "password123",
        };

        await request(app).post("/api/auth/register").send(userData);

        const res = await request(app).post("/api/auth/login").send({
            email: userData.email,
            password: userData.password,
        });

        authToken = res.body.accessToken;
        userId = res.body.userId;
    };

    const setupRoom = async () => {
        const room = await Room.create({
            name: "Integration Room",
            capacity: 20,
        });
        roomId = room._id.toString();
    };

    // --- Authentication ---
    it("TC-55: POST /api/auth/register - Should register a new user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "NewUser",
            email: "new@example.com",
            password: "password123",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("TC-56: POST /api/auth/login - Should return a JWT token", async () => {
        await setupUser();

        const res = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("accessToken");
    });

    it("TC-57: POST /api/auth/register - Should fail (409) if email exists", async () => {
        await setupUser();

        const res = await request(app).post("/api/auth/register").send({
            username: "Imposter",
            email: "test@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("Email already used");
    });

    it("TC-58: POST /api/auth/register - Should fail (412) if missing password", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "BadUser",
            email: "bad@example.com",
        });

        expect(res.statusCode).toBe(412);
        expect(res.body.message).toBe("Validation failed");
    });

    // --- Room Management ---
    it("TC-59: POST /api/rooms/seed - Should populate rooms", async () => {
        const res = await request(app).post("/api/rooms/seed");
        expect(res.statusCode).toBe(201);

        const count = await Room.countDocuments();
        expect(count).toBeGreaterThan(0);
    });

    it("TC-60: GET /api/rooms - Should retrieve rooms", async () => {
        await setupRoom();
        const res = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    // --- Booking Flow ---
    it("TC-61: POST /api/bookings - Should create a booking", async () => {
        await setupUser();
        await setupRoom();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0);
        const startTime = tomorrow.toISOString();

        const end = new Date(tomorrow);
        end.setHours(11, 0, 0, 0);
        const endTime = end.toISOString();

        const res = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ roomId, startTime, endTime });

        expect(res.statusCode).toBe(201);
    });

    it("TC-62: POST /api/bookings - Should reject overlapping booking", async () => {
        await setupUser();
        await setupRoom();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0);
        const startTime = tomorrow.toISOString();

        const end = new Date(tomorrow);
        end.setHours(11, 0, 0, 0);
        const endTime = end.toISOString();

        // Booking 1
        await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ roomId, startTime, endTime });

        // Booking 2 (Same Time)
        const res = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ roomId, startTime, endTime });

        expect(res.statusCode).toBe(409); // ROOM_OCCUPIED
    });

    it("TC-63: GET /api/bookings/my-bookings - Should list user bookings", async () => {
        await setupUser();
        await setupRoom();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0);
        const startTime = tomorrow.toISOString();

        const end = new Date(tomorrow);
        end.setHours(11, 0, 0, 0);
        const endTime = end.toISOString();

        await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ roomId, startTime, endTime });

        const res = await request(app)
            .get("/api/bookings/my-bookings")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it("TC-64: DELETE /api/bookings/:id - Should cancel booking", async () => {
        await setupUser();
        await setupRoom();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0);
        const startTime = tomorrow.toISOString();

        const end = new Date(tomorrow);
        end.setHours(11, 0, 0, 0);
        const endTime = end.toISOString();

        // Create
        const createRes = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                roomId,
                startTime,
                endTime,
            });

        const bookingId = createRes.body._id;

        // Delete
        const deleteRes = await request(app)
            .delete(`/api/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(deleteRes.statusCode).toBe(200);
    });
});
