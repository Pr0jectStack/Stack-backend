const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

// TODO: Should we just use MongoDB enums here?

const Task = new Schema({
  taskDescription: {
    type: String,
    trim: true,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    default: "",
  },
  priority: {
    type: String,
    default: "NORMAL",
  },
  status: {
    type: String,
    default: "BACKLOG",
  },
  membersAssigned: [{ type: ObjectId, ref: "User" }],
  assignedBy: [{ type: ObjectId, ref: "User" }],
});

module.exports = mongoose.models.Task || mongoose.model("Task", Task);
