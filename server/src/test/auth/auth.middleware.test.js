const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/auth.middleware");
const {
    registerValidation,
    loginValidation,
} = require("../../middleware/authvalidation.middleware");

jest.mock("jsonwebtoken");

describe("auth.middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("TC-07: should call next if token is valid", () => {
        const req = { headers: { authorization: "Bearer validtoken" } };
        const res = {};
        const next = jest.fn();
        jwt.verify.mockReturnValue({ userId: "123" });

        authMiddleware(req, res, next);

        expect(req.user.userId).toEqual("123");
        expect(next).toHaveBeenCalled();
    });

    it("TC-08: should return 401 if token is invalid", () => {
        const req = { headers: { authorization: "Bearer invalidtoken" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Authentification Failed",
        });
    });

    it("TC-09: should return 401 if authorization header is missing", () => {
        const req = { headers: {} }; // No authorization key
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});

describe("authvalidation.middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("TC-10: registerValidation passes valid data", async () => {
        const req = {
            body: {
                username: "user",
                email: "test@example.com",
                password: "123456",
            },
        };
        const res = {};
        const next = jest.fn();
        await registerValidation(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("TC-11: registerValidation fails invalid data", async () => {
        const req = {
            body: { username: "", email: "bademail", password: "123" },
        };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        await registerValidation(req, res, next);
        expect(res.status).toHaveBeenCalledWith(412);
        expect(res.send).toHaveBeenCalled();
    });

    it("TC-12: loginValidation passes valid data", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = {};
        const next = jest.fn();
        await loginValidation(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("TC-13: loginValidation fails invalid data", async () => {
        const req = { body: { email: "", password: "" } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        await loginValidation(req, res, next);
        expect(res.status).toHaveBeenCalledWith(412);
        expect(res.send).toHaveBeenCalled();
    });
});
