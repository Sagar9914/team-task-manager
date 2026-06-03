const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const projectController = require("../controllers/projectController");

router.get("/", auth(), projectController.getProjects);
router.post("/", auth("ADMIN"), projectController.createProject);
router.post("/:projectId/members", auth("ADMIN"), projectController.addMemberToProject);

module.exports = router;