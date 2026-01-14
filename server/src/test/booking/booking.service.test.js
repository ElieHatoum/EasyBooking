const bookingService = require("../../services/bookings.service");
const Booking = require("../../models/booking.model");

// 1. Mock the Mongoose Model
jest.mock("../../models/booking.model");

describe("Booking Service", () => {
    // We freeze "Now" to a specific date to make time-based tests reliable.
    // Let's pretend "Today" is January 1st, 2025, at 12:00 PM.
    const MOCK_NOW = new Date("2025-01-01T12:00:00Z");

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_NOW);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST: createBooking ---
    describe("createBooking", () => {
        const userId = "user123";
        const roomId = "room123";

        // Helper to get a valid future date string relative to our MOCK_NOW
        const validStart = "2025-01-02T10:00:00.000Z"; // Future (Jan 2nd)
        const validEnd = "2025-01-02T11:00:00.000Z";

        it("TC-28: should throw error if start time is in the past", async () => {
            const pastDate = "2024-01-01T10:00:00.000Z"; // Before 2025

            await expect(
                bookingService.createBooking(userId, roomId, pastDate, validEnd)
            ).rejects.toThrow("Cannot book a room in the past");
        });

        it("TC-29: should throw error if end time is before start time", async () => {
            const endBeforeStart = "2025-01-02T09:00:00.000Z"; // 09:00 is before 10:00

            await expect(
                bookingService.createBooking(
                    userId,
                    roomId,
                    validStart,
                    endBeforeStart
                )
            ).rejects.toThrow("End time must be after start time");
        });

        it("TC-30: should throw error if times are not hourly (e.g. 10:15)", async () => {
            const notHourly = "2025-01-02T10:15:00.000Z";

            await expect(
                bookingService.createBooking(
                    userId,
                    roomId,
                    notHourly,
                    validEnd
                )
            ).rejects.toThrow(/full hours only/);
        });

        it("TC-31: should throw error if outside business hours (before 08:00)", async () => {
            // definitely < 8
            const tooEarly = "2025-01-02T04:00:00.000Z";
            const endEarly = "2025-01-02T05:00:00.000Z";

            await expect(
                bookingService.createBooking(userId, roomId, tooEarly, endEarly)
            ).rejects.toThrow(
                "Bookings are only allowed between 08:00 and 18:00"
            );
        });

        it("TC-32: should throw error if outside business hours (after 18:00)", async () => {
            // definitely > 18
            const endLate = "2025-01-02T19:00:00.000Z";

            await expect(
                bookingService.createBooking(
                    userId,
                    roomId,
                    validStart,
                    endLate
                )
            ).rejects.toThrow(
                "Bookings are only allowed between 08:00 and 18:00"
            );
        });

        it("TC-33: should throw error if start time is at closing time (start at 18:00)", async () => {
            // definitely > 18
            const startLate = "2025-01-02T18:00:00.000Z";
            const endLate = "2025-01-02T19:00:00.000Z";
            await expect(
                bookingService.createBooking(userId, roomId, startLate, endLate)
            ).rejects.toThrow(
                "Bookings are only allowed between 08:00 and 18:00"
            );
        });

        it("TC-34: should throw error (409) if room is occupied", async () => {
            // Mock findOne to return a "conflict" object (simulating a found booking)
            Booking.findOne.mockResolvedValue({ _id: "conflict123" });

            await expect(
                bookingService.createBooking(
                    userId,
                    roomId,
                    validStart,
                    validEnd
                )
            ).rejects.toMatchObject({
                message: "ROOM_OCCUPIED",
                statusCode: 409,
            });

            // Ensure DB query looked for overlaps correctly
            expect(Booking.findOne).toHaveBeenCalledWith({
                room: roomId,
                startTime: { $lt: validEnd },
                endTime: { $gt: validStart },
            });
        });

        it("TC-35: should create booking if validation passes and room is free", async () => {
            // 1. Mock findOne to return null (no conflict)
            Booking.findOne.mockResolvedValue(null);

            // 2. Mock the .save() method on the instance
            // Since `new Booking(...)` returns an object, we need to mock the implementation
            // of the constructor to return an object with a save() function.
            const saveMock = jest.fn().mockResolvedValue({
                _id: "newBooking123",
                roomId,
                startTime: validStart,
            });

            Booking.mockImplementation(() => ({
                save: saveMock,
            }));

            const result = await bookingService.createBooking(
                userId,
                roomId,
                validStart,
                validEnd
            );

            expect(result).toHaveProperty("_id", "newBooking123");
            expect(saveMock).toHaveBeenCalled();
        });
    });

    // --- TEST: getUserBookings ---
    describe("getUserBookings", () => {
        it("TC-36: should fetch, populate, and sort bookings", async () => {
            const mockBookings = [{ _id: "b1" }, { _id: "b2" }];

            // Mocking the Mongoose Chain: find -> populate -> sort -> return data
            const mockSort = jest.fn().mockResolvedValue(mockBookings);
            const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
            Booking.find.mockReturnValue({ populate: mockPopulate });

            const result = await bookingService.getUserBookings("user123");

            expect(Booking.find).toHaveBeenCalledWith({ user: "user123" });
            expect(mockPopulate).toHaveBeenCalledWith("room", [
                "name",
                "capacity",
            ]);
            expect(mockSort).toHaveBeenCalledWith({ startTime: -1 });
            expect(result).toEqual(mockBookings);
        });
    });

    // --- TEST: deleteBooking ---
    describe("deleteBooking", () => {
        it("TC-37: should return deleted booking if found", async () => {
            const mockDeleted = { _id: "b123", userId: "user1" };
            Booking.findOneAndDelete.mockResolvedValue(mockDeleted);

            const result = await bookingService.deleteBooking("user1", "b123");

            expect(Booking.findOneAndDelete).toHaveBeenCalledWith({
                _id: "b123",
                userId: "user1",
            });
            expect(result).toEqual(mockDeleted);
        });

        it("TC-38: should throw 404 if booking not found or user unauthorized", async () => {
            Booking.findOneAndDelete.mockResolvedValue(null); // Nothing found

            await expect(
                bookingService.deleteBooking("user1", "b123")
            ).rejects.toMatchObject({
                message: "Booking not found",
                statusCode: 404,
            });
        });
    });
});
