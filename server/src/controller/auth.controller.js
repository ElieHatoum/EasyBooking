const asyncHandler = require("express-async-handler");
const { registerUser, loginUser } = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await registerUser(username, email, password);
        return res.status(201).json({
            success: true,
            message: "User created",
            user: user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const verified = await loginUser(email, password);
        return res.status(200).json(verified);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            success: false,
        });
    }
});

module.exports = { register, login };
