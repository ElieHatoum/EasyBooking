const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../server");
const Room = require("../models/room.model");

let mongoServer;

// --- SETUP ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

describe("Security & Penetration Tests", () => {
    // --- HELPERS ---
    const createUser = async (name) => {
        const email = `${name}@test.com`;
        const password = "password123";

        // Register
        await request(app).post("/api/auth/register").send({
            username: name,
            email,
            password,
        });

        // Login
        const res = await request(app).post("/api/auth/login").send({
            email,
            password,
        });

        return {
            token: res.body.accessToken,
            userId: res.body.userId,
        };
    };

    const createRoom = async () => {
        const room = await Room.create({ name: "Security Room", capacity: 10 });
        return room._id.toString();
    };

    it("SEC-01: User B cannot delete User A's booking", async () => {
        const userA = await createUser("UserA");
        const userB = await createUser("UserB");
        const roomId = await createRoom();

        // User A creates a booking (Tomorrow)
        const start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(10, 0, 0, 0);
        const end = new Date(start);
        end.setHours(11, 0, 0, 0);

        const createRes = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ roomId, startTime: start, endTime: end });

        const bookingId = createRes.body._id;

        // User B tries to DELETE that booking
        const attackRes = await request(app)
            .delete(`/api/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${userB.token}`);

        expect(attackRes.statusCode).toBe(404);
        expect(attackRes.body.message).toBe("Booking not found");
    });

    it("SEC-02: Should prevent NoSQL Injection on Login", async () => {
        await createUser("Victim");

        const payload = {
            email: { $ne: null },
            password: "password123",
        };

        const res = await request(app).post("/api/auth/login").send(payload);
        expect(res.statusCode).toBe(412);
    });

    it("SEC-03: Should reject forged JWT tokens", async () => {
        const roomId = await createRoom();

        // Create a fake token (signed with wrong secret)
        const jwt = require("jsonwebtoken");
        const forgedToken = jwt.sign(
            { userId: "12345", email: "hacker@test.com" },
            "WRONG_SECRET_KEY"
        );

        const res = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${forgedToken}`)
            .send({
                roomId,
                startTime: new Date(),
                endTime: new Date(),
            });

        expect([401, 403]).toContain(res.statusCode);
    });

    it("SEC-04: Should handle malicious scripts in input fields", async () => {
        const user = await createUser("ScriptKiddie");

        // Malicious room name
        const xssPayload = "<script>alert('pwned')</script>";

        const res = await request(app).post("/api/auth/register").send({
            username: xssPayload,
            email: "xss@test.com",
            password: "password123",
        });

        // Validator should reject special chars
        expect(res.statusCode).not.toBe(500);
    });

    it("SEC-05: Should NOT return sensitive data in responses", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "SafeUser",
            email: "safe@test.com",
            password: "password123",
        });

        const responseBody = res.body;

        if (responseBody.user) {
            expect(responseBody.user.password).toBeUndefined();
            expect(responseBody.user).not.toHaveProperty("password");
        }

        expect(responseBody.password).toBeUndefined();
    });

    it("SEC-06: Should reject expired JWT tokens", async () => {
        const roomId = await createRoom();
        const jwt = require("jsonwebtoken");

        // Create a token that expired 1 hour ago
        const expiredToken = jwt.sign(
            { userId: "12345", email: "old@test.com" },
            process.env.JWT_SECRET,
            { expiresIn: "-1h" }
        );

        const res = await request(app)
            .post("/api/bookings")
            .set("Authorization", `Bearer ${expiredToken}`)
            .send({
                roomId,
                startTime: new Date(),
                endTime: new Date(),
            });

        expect(res.statusCode).toBe(401);
    });

    it("SEC-07: Should enforce strong password", async () => {
        const weakUser = {
            username: "WeakPass",
            email: "weak@test.com",
            password: "123",
        };

        const res = await request(app)
            .post("/api/auth/register")
            .send(weakUser);

        expect(res.statusCode).toBe(412);
        expect(res.body.data.errors.password).toBeDefined();
    });

    it("SEC-08: Should handle unexpected data types", async () => {
        const payload = {
            username: ["Not", "A", "String"],
            email: "valid@test.com",
            password: "password123",
        };

        const res = await request(app).post("/api/auth/register").send(payload);

        expect(res.statusCode).not.toBe(201);
        if (res.statusCode === 412) {
            // Perfect handling
            expect(res.body.message).toBe("Validation failed");
        }
    });

    it("SEC-09: Should not leak stack traces on server errors", async () => {
        const malformedId = "123";
        const user = await createUser("StackTest");

        const res = await request(app)
            .delete(`/api/bookings/${malformedId}`)
            .set("Authorization", `Bearer ${user.token}`);

        // body should not contain dangerous leak info
        if (res.statusCode === 500 || res.statusCode === 400) {
            const bodyString = JSON.stringify(res.body);

            // regex to check for file paths
            expect(bodyString).not.toMatch(
                /\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\//
            );
            expect(bodyString).not.toMatch(/[A-Z]:\\[a-zA-Z0-9]+\\/);

            // node_modules leakage
            expect(bodyString).not.toMatch(/node_modules/);

            // specific stack keywords combined with file extensions
            expect(bodyString).not.toMatch(/\.js:\d+:\d+/);
        } else {
            expect(res.statusCode).not.toBe(200);
        }
    });

    it("SEC-10: Should reject payloads larger than the default limit", async () => {
        // Create a string that is approx 10MB in size
        const massiveString = new Array(10000000).join("a");

        const res = await request(app).post("/api/auth/register").send({
            username: "BigDataUser",
            email: "big@test.com",
            password: massiveString,
        });

        expect(res.statusCode).toBe(413);
    });
});
