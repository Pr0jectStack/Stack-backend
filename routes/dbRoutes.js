const express = require("express");
const { getUserById, updateUserProfile } = require("../controllers/user");
const { createWorkspace } = require("../controllers/workspace");
const router = express.Router();

router.get("/getUserById", getUserById);

router.put("/updateUserProfile", updateUserProfile);

router.post("/createWorkspace", createWorkspace);

module.exports = router;
