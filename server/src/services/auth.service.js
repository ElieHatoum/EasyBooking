const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const userModel = require("../models/user.model");

const registerUser = async (username, email, password) => {
    const emailExists = await userModel.findOne({ email: email });

    if (emailExists) {
        const error = new Error("Email already used");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const date = new Date();

    const user = new userModel({
        username: username,
        email: email,
        password: hashedPassword,
        createdAt: date,
    });

    const savedUser = await user.save();

    return {
        _id: savedUser.id,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
    };
};

const loginUser = async (email, password) => {
    const user = await userModel.findOne({ email: email });

    if (!user) {
        const error = new Error("Authentication failed");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
        const error = new Error("Authentication failed");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            email: user.email,
            userId: user.id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    return { accessToken: token, userId: user.id };
};

module.exports = { registerUser, loginUser };
