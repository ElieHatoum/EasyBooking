const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../../models/user.model");
const { registerUser, loginUser } = require("../../services/auth.service");

// Mock dependencies but NOT the auth service itself
jest.mock("../../models/user.model");
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");

describe("auth.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("TC-14: registerUser throws if email exists", async () => {
        userModel.findOne.mockResolvedValue({ email: "test@example.com" });
        await expect(
            registerUser("test@example.com", "123456")
        ).rejects.toThrow("Email already used");
    });

    it("TC-15: registerUser creates user if email not exists", async () => {
        userModel.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashedpw");
        userModel.mockImplementation(function (data) {
            return {
                ...data,
                save: jest.fn().mockResolvedValue({
                    id: "1",
                    email: data.email,
                    createdAt: data.createdAt,
                }),
            };
        });

        const user = await registerUser("user", "test@example.com", "123456");
        expect(user.email).toBe("test@example.com");
        expect(user._id).toBe("1");
    });

    it("TC-16: loginUser throws if user not found", async () => {
        userModel.findOne.mockResolvedValue(null);
        await expect(loginUser("test@example.com", "123456")).rejects.toThrow(
            "Authentication failed"
        );
    });

    it("TC-17: loginUser throws if password does not match", async () => {
        userModel.findOne.mockResolvedValue({
            email: "test@example.com",
            password: "hashedpw",
            id: "1",
        });
        bcrypt.compare.mockResolvedValue(false);
        await expect(loginUser("test@example.com", "wrongpw")).rejects.toThrow(
            "Authentication failed"
        );
    });

    it("TC-18: loginUser returns token if credentials valid", async () => {
        userModel.findOne.mockResolvedValue({
            email: "test@example.com",
            password: "hashedpw",
            id: "1",
        });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("token123");
        const result = await loginUser("test@example.com", "123456");
        expect(result.accessToken).toBe("token123");
    });
});
