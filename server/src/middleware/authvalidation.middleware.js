const Validator = require("validatorjs");

const validateRule = {
    email: "required|email",
    username: "required|string|min:3|max:20",
    password: "required|string|min:6",
};

const validateRuleLogIn = {
    email: "required|email",
    password: "required|string",
};

const registerValidation = async (req, res, next) => {
    let validation = new Validator(req.body, validateRule);
    if (!validation.passes()) {
        return res.status(412).send({
            success: false,
            message: "Validation failed",
            data: validation.errors,
        });
    }
    next();
};

const loginValidation = async (req, res, next) => {
    let validation = new Validator(req.body, validateRuleLogIn);

    if (!validation.passes()) {
        return res.status(412).send({
            success: false,
            message: "Validation failed",
            data: validation.errors,
        });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
};
