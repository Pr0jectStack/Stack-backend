const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

// TODO: List of categories should be stored here ?

const Team = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    teamLeader: {
      type: ObjectId,
      ref: "User",
      trim: true,
    },
    members: [{ type: ObjectId, ref: "User" }],
    inviteLink: {
      type: String,
      required: true,
    },
    tasks: [{ type: ObjectId, ref: "Task" }],
    hidden:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Team || mongoose.model("Team", Team);
