const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: Should we just use MongoDB enums here?

const Notification = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    default: "UNREAD",
  },
});

module.exports =
  mongoose.models.Notification || mongoose.models("Notification", Notification);
