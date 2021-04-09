const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");

const { ObjectId } = Schema;

const User = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    encrypted_password: {
      type: String,
      required: true,
      minlength: 8,
    },
    salt: {
      type: String,
    },
    image: {
      data: Buffer,
      contentType: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    contribution: [{ type: ObjectId }],
    socialMediaHandles: {
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    workspaces: [{ type: ObjectId, ref: "Workspace" }],
    teams: [{ type: ObjectId, ref: "Team" }],
    skypeId: {
      type: String,
      default: "",
    },
    notifications: [
      {
        type: ObjectId,
        ref: "Notification",
      },
    ],
    resetLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

// TODO: Can we use mongoose nested arrays or subdocuments for teams ?

// Generate 'salt' for the user and encrypt the plain text passsword.
User.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encrypted_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

/**
 * 'authenticate': Rehash password and check for equality of hashes
 * 'securePassword': Hash the plain text password and store the salt and the
 *                  encrypted password in the database.
 */
User.methods = {
  authenticate: function (plainPassword) {
    return this.securePassword(plainPassword) === this.encrypted_password;
  },
  securePassword: function (plainPassword) {
    // console.log(plainPassword);
    // console.log(this.salt);
    if (!plainPassword) return "";
    try {
      const secret = this.salt;
      return crypto
        .createHmac("sha256", secret)
        .update(plainPassword)
        .digest("hex");
    } catch (err) {
      // console.log(err);
      return "";
    }
  },
};

module.exports = mongoose.models.User || mongoose.model("User", User);
