"use strict";

const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  signup,
  signin,
  signout,
  usernameAvailability
} = require("../controllers/auth");


router.post(
  "/signUp",
  [
    check(
      "firstName",
      "Name must consists of only Alphabets and must be atleast 3 characters long"
    )
      .notEmpty()
      .isString()
      .isLength({
        min: 3,
      }),
    check("email", "Enter a valid email").normalizeEmail().isEmail(),
    check("password", "Password must be atleast 8 characters long").isLength({
      min: 8,
    }),
  ],
  signup
);

router.post(
  "/signIn",
  [
    check("password", "Password must be atleast 8 characters long").isLength({
      min: 8,
    }),
  ],
  signin
);

router.get("/signOut", signout);

router.post("/checkUserNameAvailability",usernameAvailability);

module.exports = router;