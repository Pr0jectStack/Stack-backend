const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { ObjectId } = Schema;

const Chat = new Schema(
  {
    chatId: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
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
  },
  { timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model("Chat", Chat);
