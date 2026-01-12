const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controller/bookings.controller");

router.post("/", auth, controller.createBooking);
router.get("/my-bookings", auth, controller.getMyBookings);
router.delete("/:bookingId", auth, controller.deleteBooking);

module.exports = router;
