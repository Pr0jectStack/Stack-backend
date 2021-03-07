const express = require("express");
const { getUserById, updateUserProfile } = require("../controllers/user");

const router = express.Router();

router.get("/getUserById", getUserById);

router.put("/updateUserProfile", updateUserProfile);
