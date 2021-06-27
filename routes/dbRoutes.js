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
  updateWorkspaceDetails,
  restoreWorkspace,
  getHiddenWorkspaces,
} = require("../controllers/workspace");
const {
  createTeam,
  addMembersToTeam,
  getTeamById,
  hideTeam,
  restoreTeam,
  makeTeamLeader,
  updateTeamDetails,
  getHiddenTeams,
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
router.put("/updateWorkspaceDetails", updateWorkspaceDetails);

router.post("/createTeam", createTeam);
router.post("/addMembersToTeam", addMembersToTeam);
router.get("/getTeamById", getTeamById);
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

router.post("/hideWorkspace", hideWorkspace);
router.post("/hideTeam", hideTeam);
router.post("/restoreWorkspace", restoreWorkspace);
router.post("/restoreTeam", restoreTeam);

router.get("/getHiddenTeams", getHiddenTeams);
router.get("/getHiddenWorkspaces", getHiddenWorkspaces);

module.exports = router;
