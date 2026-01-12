const { registerUser, loginUser } = require("../../services/auth.service");
const { register, login } = require("../../controller/auth.controller");

// Mock the auth service for controller tests
jest.mock("../../services/auth.service");

describe("auth.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("register returns 201 on success", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const user = {
            _id: "1",
            email: "test@example.com",
            createdAt: expect.any(String),
        };

        registerUser.mockResolvedValue(user);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "User created",
            user,
        });
    });

    it("register returns error on failure", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const error = new Error("Email already used");
        error.statusCode = 409;

        registerUser.mockRejectedValue(error);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Email already used",
        });
    });

    it("register returns 500 when error has no statusCode", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const error = new Error("Unexpected error");

        registerUser.mockRejectedValue(error);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unexpected error",
        });
    });

    it("login returns 200 on success", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const verified = { accessToken: "token123" };

        loginUser.mockResolvedValue(verified);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(verified);
    });

    it("login returns error on failure", async () => {
        const req = {
            body: { email: "test@example.com", password: "wrongpw" },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const error = new Error("Authentication failed");
        error.statusCode = 401;

        loginUser.mockRejectedValue(error);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Authentication failed",
            success: false,
        });
    });

    it("login returns 500 when error has no statusCode", async () => {
        const req = {
            body: { email: "test@example.com", password: "wrongpw" },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const error = new Error("Database connection failed");

        loginUser.mockRejectedValue(error);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database connection failed",
            success: false,
        });
    });
});
