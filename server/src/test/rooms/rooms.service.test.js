const roomService = require("../../services/rooms.service");
const Room = require("../../models/room.model");
const Booking = require("../../models/booking.model");

jest.mock("../../models/room.model");
jest.mock("../../models/booking.model");

describe("Room Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST: getAllRooms ---
    describe("getAllRooms", () => {
        it("TC-46: should return all rooms if no capacity is provided", async () => {
            const mockRooms = [{ name: "A1" }, { name: "B2" }];
            Room.find.mockResolvedValue(mockRooms);

            const result = await roomService.getAllRooms();

            expect(Room.find).toHaveBeenCalledWith({});
            expect(result).toEqual(mockRooms);
        });

        it("TC-47: should filter by capacity if provided", async () => {
            const mockRooms = [{ name: "Large Room", capacity: 20 }];
            Room.find.mockResolvedValue(mockRooms);

            const result = await roomService.getAllRooms(15);

            expect(Room.find).toHaveBeenCalledWith({
                capacity: { $gte: 15 },
            });
            expect(result).toEqual(mockRooms);
        });

        it("TC-48: should handle string inputs for capacity correctly", async () => {
            await roomService.getAllRooms("10");

            expect(Room.find).toHaveBeenCalledWith({
                capacity: { $gte: 10 },
            });
        });
    });

    // --- TEST: getRoomAvailability ---
    describe("getRoomAvailability", () => {
        const roomId = "room123";
        const queryDate = "2025-01-01";

        const time = (hours) => {
            const d = new Date(queryDate);
            d.setHours(hours, 0, 0, 0);
            return d;
        };

        it("TC-49: should return full day (08:00 - 18:00) if no bookings exist", async () => {
            // Mock: No bookings found
            const mockSort = jest.fn().mockResolvedValue([]);
            Booking.find.mockReturnValue({ sort: mockSort });

            const slots = await roomService.getRoomAvailability(
                roomId,
                queryDate
            );

            expect(Booking.find).toHaveBeenCalled();
            expect(slots).toHaveLength(1);
            expect(slots[0]).toEqual({
                startTime: time(8), // 08:00
                endTime: time(18), // 18:00
            });
        });

        it("TC-50: should calculate gaps around a single booking", async () => {
            // Scenario: Booking from 10:00 to 12:00
            const booking = {
                startTime: time(10),
                endTime: time(12),
            };

            const mockSort = jest.fn().mockResolvedValue([booking]);
            Booking.find.mockReturnValue({ sort: mockSort });

            const slots = await roomService.getRoomAvailability(
                roomId,
                queryDate
            );

            // Expect 2 slots: 08:00-10:00 AND 12:00-18:00
            expect(slots).toHaveLength(2);
            expect(slots[0].startTime).toEqual(time(8));
            expect(slots[0].endTime).toEqual(time(10));

            expect(slots[1].startTime).toEqual(time(12));
            expect(slots[1].endTime).toEqual(time(18));
        });

        it("TC-51: should return NO slots if fully booked (08:00 - 18:00)", async () => {
            // Scenario: One massive booking all day
            const booking = {
                startTime: time(8),
                endTime: time(18),
            };

            const mockSort = jest.fn().mockResolvedValue([booking]);
            Booking.find.mockReturnValue({ sort: mockSort });

            const slots = await roomService.getRoomAvailability(
                roomId,
                queryDate
            );

            expect(slots).toHaveLength(0);
        });

        it("TC-52: should handle overlapping gaps correctly (sequential bookings)", async () => {
            // Scenario: 09:00-10:00 AND 10:00-11:00
            // Gaps should be: 08:00-09:00 AND 11:00-18:00
            const bookings = [
                { startTime: time(9), endTime: time(10) },
                { startTime: time(10), endTime: time(11) },
            ];

            const mockSort = jest.fn().mockResolvedValue(bookings);
            Booking.find.mockReturnValue({ sort: mockSort });

            const slots = await roomService.getRoomAvailability(
                roomId,
                queryDate
            );

            expect(slots).toHaveLength(2);
            expect(slots[0]).toEqual({ startTime: time(8), endTime: time(9) });
            expect(slots[1]).toEqual({
                startTime: time(11),
                endTime: time(18),
            });
        });
    });

    // --- TEST: seedRooms ---
    describe("seedRooms", () => {
        it("TC-53: should insert default rooms", async () => {
            // Mock insertMany
            Room.insertMany.mockResolvedValue(["room1", "room2"]);

            const result = await roomService.seedRooms();

            expect(Room.insertMany).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ name: "Salle A201" }),
                    expect.objectContaining({ capacity: 50 }),
                ])
            );
            expect(result).toHaveLength(2);
        });

        it("TC-54: should throw error if seeding fails", async () => {
            Room.insertMany.mockRejectedValue(new Error("DB Error"));

            await expect(roomService.seedRooms()).rejects.toThrow("DB Error");
        });
    });
});
