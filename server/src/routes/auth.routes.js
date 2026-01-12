const express = require("express");

const router = express.Router();

const {
    registerValidation,
    loginValidation,
} = require("../middleware/authvalidation.middleware");

const { login, register } = require("../controller/auth.controller");

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

module.exports = router;
