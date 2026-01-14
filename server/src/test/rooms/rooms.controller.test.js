const roomController = require("../../controller/rooms.controller");
const roomService = require("../../services/rooms.service");

jest.mock("../../services/rooms.service");

const mockRequest = (body = {}, params = {}, query = {}, user = {}) => ({
    body,
    params,
    query,
    user,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("Room Controller", () => {
    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST: getRooms ---
    describe("getRooms", () => {
        it("TC-39: should return 200 and list of rooms", async () => {
            const req = mockRequest({}, {}, {});
            const res = mockResponse();
            const mockRooms = [{ name: "A1" }, { name: "B2" }];

            roomService.getAllRooms.mockResolvedValue(mockRooms);

            await roomController.getRooms(req, res);

            // Check if service was called with undefined
            expect(roomService.getAllRooms).toHaveBeenCalledWith(undefined);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRooms);
        });

        it("TC-40: should pass capacity filter to the service", async () => {
            const req = mockRequest({}, {}, { capacity: "10" });
            const res = mockResponse();

            roomService.getAllRooms.mockResolvedValue([]);

            await roomController.getRooms(req, res);

            expect(roomService.getAllRooms).toHaveBeenCalledWith("10");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("TC-41: should return 500 on server error", async () => {
            const req = mockRequest();
            const res = mockResponse();

            roomService.getAllRooms.mockRejectedValue(
                new Error("DB Connection Failed")
            );

            await roomController.getRooms(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Server error");
        });
    });

    // --- TEST: getRoomAvailability ---
    describe("getRoomAvailability", () => {
        it("TC-42: should return 200 and availability slots", async () => {
            const req = mockRequest(
                {},
                { id: "room123" },
                { date: "2025-01-01" }
            );
            const res = mockResponse();

            const mockSlots = [{ startTime: "08:00", endTime: "10:00" }];
            roomService.getRoomAvailability.mockResolvedValue(mockSlots);

            await roomController.getRoomAvailability(req, res);

            expect(roomService.getRoomAvailability).toHaveBeenCalledWith(
                "room123",
                "2025-01-01"
            );

            // Check specific JSON structure required by frontend
            expect(res.json).toHaveBeenCalledWith({
                roomId: "room123",
                availableSlots: mockSlots,
            });
        });

        it("TC-43: should return 500 if service throws error", async () => {
            const req = mockRequest({}, { id: "room123" }, {});
            const res = mockResponse();

            const error = new Error("Invalid Date");
            roomService.getRoomAvailability.mockRejectedValue(error);

            await roomController.getRoomAvailability(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid Date" });
        });
    });

    // --- TEST: seedDatabase ---
    describe("seedDatabase", () => {
        it("TC-44: should return 201 on success", async () => {
            const req = mockRequest();
            const res = mockResponse();

            roomService.seedRooms.mockResolvedValue(true);

            await roomController.seedDatabase(req, res);

            expect(roomService.seedRooms).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                msg: "Rooms added successfully",
            });
        });

        it("TC-45: should return 500 if seeding fails", async () => {
            const req = mockRequest();
            const res = mockResponse();

            roomService.seedRooms.mockRejectedValue(new Error("Duplicate Key"));

            await roomController.seedDatabase(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Duplicate Key");
        });
    });
});
