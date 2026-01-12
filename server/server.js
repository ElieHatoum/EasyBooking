require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db.config.js");
const auth = require("./src/routes/auth.routes.js");
const rooms = require("./src/routes/rooms.routes.js");
const bookings = require("./src/routes/bookings.routes.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth);
app.use("/api/rooms", rooms);
app.use("/api/bookings", bookings);

connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
