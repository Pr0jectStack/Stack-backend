const express = require("express");
const { getUserById, updateUserProfile } = require("../controllers/user");
const {
  createWorkspace,
  getWorkspaceById,
} = require("../controllers/workspace");
const {createTeam} = require("../controllers/team");
const router = express.Router();

router.get("/getUserById", getUserById);

router.put("/updateUserProfile", updateUserProfile);

router.post("/createWorkspace", createWorkspace);
router.post("/createTeam", createTeam);

router.post("/getWorkspaceById", getWorkspaceById);

module.exports = router;
