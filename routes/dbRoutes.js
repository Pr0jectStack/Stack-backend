const express = require("express");
const {
  getUserById,
  updateUserProfile,
  updateUserPassword,
  updateUserImage,
} = require("../controllers/user");
const {
  createWorkspace,
  getWorkspaceById,
  addMembersToWorkspace,
} = require("../controllers/workspace");
const { createTeam, addMembersToTeam } = require("../controllers/team");
const router = express.Router();

router.get("/getUserById", getUserById);

router.put("/updateUserProfile", updateUserProfile);
router.put("/updateUserPassword", updateUserPassword);
router.put("/updateUserImage", updateUserImage);

router.post("/createWorkspace", createWorkspace);
router.post("/createTeam", createTeam);

router.post("/getWorkspaceById", getWorkspaceById);

router.post("/addMembersToWorkspace", addMembersToWorkspace);
router.post("/addMembersToTeam", addMembersToTeam);

module.exports = router;
