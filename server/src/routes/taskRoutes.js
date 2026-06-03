const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const taskController = require("../controllers/taskController");

router.get("/dashboard/summary", auth(), taskController.getDashboard);
router.post("/", auth("ADMIN"), taskController.createTask);
router.get("/", auth(), taskController.getTasks);
router.patch("/:id/status", auth(), taskController.updateTaskStatus);
module.exports = router;