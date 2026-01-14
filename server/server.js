require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db.config.js");
const auth = require("./src/routes/auth.routes.js");
const rooms = require("./src/routes/rooms.routes.js");
const bookings = require("./src/routes/bookings.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth);
app.use("/api/rooms", rooms);
app.use("/api/bookings", bookings);
app.get("/api/healthz", (req, res) => {
    res.status(200).json({
        status: "UP",
        message: "Server is running",
        timestamp: new Date(),
    });
});

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    connectDB();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
