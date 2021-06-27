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
  deleteWorkspace,
  updateWorkspaceDetails,
  restoreWorkspace,
  getDeletedWorkspaces,
} = require("../controllers/workspace");
const {
  createTeam,
  addMembersToTeam,
  getTeamById,
  deleteTeam,
  restoreTeam,
  makeTeamLeader,
  updateTeamDetails,
  getDeletedTeams,
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
router.post("/deleteWorkspace", deleteWorkspace);
router.post("/restoreWorkspace", restoreWorkspace);
router.get("/getWorkspaceById", getWorkspaceById);
router.get("/getDeletedWorkspaces", getDeletedWorkspaces);
router.put("/updateWorkspaceDetails", updateWorkspaceDetails);

router.post("/createTeam", createTeam);
router.post("/addMembersToTeam", addMembersToTeam);
router.post("/deleteTeam", deleteTeam);
router.post("/restoreTeam", restoreTeam);
router.get("/getTeamById", getTeamById);
router.get("/getDeletedTeams", getDeletedTeams);
router.put("/makeTeamLeader", makeTeamLeader);
router.put("/updateTeamDetails", updateTeamDetails);

router.post("/addTask", addTask);
router.put("/moveTask", moveTask);
router.put("/editTask", editTask);
router.put("/assignMembersToTask", assignMembersToTask);
router.put("/removeMembersFromTask", removeMembersFromTask);
router.post("/deleteTask", deleteTask);

router.post("/addChat", addChat);
router.get("/getChats", fetchChatMessages);

module.exports = router;
