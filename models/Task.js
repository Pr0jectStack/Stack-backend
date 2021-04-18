const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

// TODO: Should we just use MongoDB enums here?

const Task = new Schema(
  {
    taskName: {
      type: String,
      trim: true,
      required: true,
    },
    taskDescription: {
      type: String,
      trim: true,
      default: "",
    },
    deadline: {
      type: Date,
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
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model("Task", Task);
