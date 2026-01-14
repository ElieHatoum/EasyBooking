const bookingController = require("../../controller/bookings.controller");
const bookingService = require("../../services/bookings.service");

jest.mock("../../services/bookings.service");

const mockRequest = (body = {}, params = {}, user = {}) => ({
    body,
    params,
    user,
    userId: user.userId,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("Booking Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- TEST: createBooking ---
    describe("createBooking", () => {
        it("TC-19: should return 201 and the booking if creation is successful", async () => {
            const req = mockRequest(
                { roomId: "room123", startTime: "10:00", endTime: "11:00" },
                {},
                { userId: "user123" }
            );
            const res = mockResponse();

            const mockBooking = {
                _id: "b1",
                roomId: "room123",
                userId: "user123",
            };

            bookingService.createBooking.mockResolvedValue(mockBooking);

            await bookingController.createBooking(req, res);

            expect(bookingService.createBooking).toHaveBeenCalledWith(
                "user123",
                "room123",
                "10:00",
                "11:00"
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockBooking);
        });

        it("TC-20: should return 400 if service throws a specific error", async () => {
            const req = mockRequest(
                { roomId: "room123" },
                {},
                { userId: "user123" }
            );
            const res = mockResponse();

            const error = new Error("Invalid time");
            error.statusCode = 400;

            // Simulate an error from the service
            bookingService.createBooking.mockRejectedValue(error);

            await bookingController.createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: "Invalid time" });
        });

        it("TC-21: should return 500 on unexpected server error", async () => {
            const req = mockRequest({}, {}, { userId: "user123" });
            const res = mockResponse();

            bookingService.createBooking.mockRejectedValue(
                new Error("Database fail")
            );

            await bookingController.createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Database fail" });
        });

        it("TC-22: should use default 'Server error' message if error object has no message", async () => {
            const req = mockRequest({}, {}, { userId: "user123" });
            const res = mockResponse();

            const errorWithoutMessage = { statusCode: 418 };
            bookingService.createBooking.mockRejectedValue(errorWithoutMessage);

            await bookingController.createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(418);
            expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
        });
    });

    // --- TEST: deleteBooking ---
    describe("deleteBooking", () => {
        it("TC-23: should return 200 on successful deletion", async () => {
            const req = mockRequest(
                {},
                { bookingId: "b123" },
                { userId: "user123" }
            );
            const res = mockResponse();

            bookingService.deleteBooking.mockResolvedValue({ _id: "b123" });

            await bookingController.deleteBooking(req, res);

            expect(bookingService.deleteBooking).toHaveBeenCalledWith(
                "user123",
                "b123"
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Booking deleted",
            });
        });

        it("TC-24: should handle 404 if booking not found", async () => {
            const req = mockRequest(
                {},
                { bookingId: "b123" },
                { userId: "user123" }
            );
            const res = mockResponse();

            const error = new Error("Booking not found");
            error.statusCode = 404;
            bookingService.deleteBooking.mockRejectedValue(error);

            await bookingController.deleteBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Booking not found",
            });
        });

        it("TC-25: should default to 500 if error has no statusCode", async () => {
            const req = mockRequest(
                {},
                { bookingId: "b123" },
                { userId: "user123" }
            );
            const res = mockResponse();

            // Standard Error object has no .statusCode property by default
            const genericError = new Error("Database went boom");
            bookingService.deleteBooking.mockRejectedValue(genericError);

            await bookingController.deleteBooking(req, res);

            // This confirms the code used the || 500 fallback
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Database went boom",
            });
        });
    });

    // --- TEST: getMyBookings ---
    describe("getMyBookings", () => {
        it("TC-26: should return 200 and list of bookings", async () => {
            const req = mockRequest();
            req.userId = "user123";
            const res = mockResponse();

            const mockList = [{ _id: "b1" }, { _id: "b2" }];
            bookingService.getUserBookings.mockResolvedValue(mockList);

            await bookingController.getMyBookings(req, res);

            expect(bookingService.getUserBookings).toHaveBeenCalledWith(
                "user123"
            );
            expect(res.json).toHaveBeenCalledWith(mockList);
        });

        it("TC-27: should return 500 if service fails", async () => {
            const req = mockRequest();
            req.userId = "user123";
            const res = mockResponse();

            bookingService.getUserBookings.mockRejectedValue(
                new Error("DB Error")
            );

            await bookingController.getMyBookings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Server error");
        });
    });
});
