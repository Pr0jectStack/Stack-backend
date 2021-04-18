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
const {
  createTeam,
  addMembersToTeam,
  getTeamById,
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
router.post("/getWorkspaceById", getWorkspaceById);
router.post("/addMembersToWorkspace", addMembersToWorkspace);

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

module.exports = router;
