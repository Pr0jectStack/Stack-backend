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
  description:{
    type:String,
    default:""
  },
  teams: [{ type: ObjectId, ref: "Team" }],
  members: [{ type: ObjectId, ref: "User" }],
});

module.exports = mongoose.models.Workspace || mongoose.model("Workspace", Workspace);
