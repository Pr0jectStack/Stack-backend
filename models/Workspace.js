const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const Workspace = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  teams: [{ type: ObjectId, ref: "Team" }],
  members: [{ type: ObjectId, ref: "User" }],
});

module.exports = mongoose.models.User || mongoose.model("Workspace", Workspace);
