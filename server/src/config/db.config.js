require("dotenv").config({ path: "./.env" });

const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose
        .connect(process.env.MONGO_URI, {})
        .then(() => console.log("Connected to database"))
        .catch((err) => console.error("Could not connect to database: ", err));
};

module.exports = { connectDB };
