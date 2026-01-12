const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new Error("Missing Authorization Header");
        }

        const token = req.headers.authorization.replace("Bearer ", "");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Authentification Failed",
        });
    }
};
