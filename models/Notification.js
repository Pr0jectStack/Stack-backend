const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { ObjectId } = Schema;

// TODO: Should we just use MongoDB enums here?

const Notification = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "UNREAD",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Notification || mongoose.models("Notification", Notification);
