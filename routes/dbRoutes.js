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
  hideWorkspace,
} = require("../controllers/workspace");
const {
  createTeam,
  addMembersToTeam,
  getTeamById,
  hideTeam,
} = require("../controllers/team");
const {
  addTask,
  moveTask,
  editTask,
  deleteTask,
  assignMembersToTask,
  removeMembersFromTask,
} = require("../controllers/tasks");
const { addChat, fetchChatMessages } = require("../controllers/chat");
const router = express.Router();

router.get("/getUserById", getUserById);

router.put("/updateUserProfile", updateUserProfile);
router.put("/updateUserPassword", updateUserPassword);
router.put("/updateUserImage", updateUserImage);

router.post("/createWorkspace", createWorkspace);
router.post("/addMembersToWorkspace", addMembersToWorkspace);
router.get("/getWorkspaceById", getWorkspaceById);

router.post("/createTeam", createTeam);
router.post("/addMembersToTeam", addMembersToTeam);
router.get("/getTeamById", getTeamById);

router.post("/addTask", addTask);
router.put("/moveTask", moveTask);
router.put("/editTask", editTask);
router.put("/assignMembersToTask", assignMembersToTask);
router.put("/removeMembersFromTask", removeMembersFromTask);
router.post("/deleteTask", deleteTask);

router.post("/addChat", addChat);
router.get("/getChats", fetchChatMessages);

router.post("/hideWorkspace", hideWorkspace);
router.post("/hideTeam", hideTeam);

module.exports = router;
