const express = require("express");
const router = express.Router();
const controller = require("../controller/rooms.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.getRooms);
router.post("/seed", controller.seedDatabase);

module.exports = router;
