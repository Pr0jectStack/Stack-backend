const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");

exports.deleteTask = (req, res) => {
  const taskId = req.body.teamId;

  Task.findOneAndDelete({ _id: taskId }, (err, task) => {
    if (err) {
      return res.status(400).json({
        error: "Unexpected error",
      });
    } else {
      return res.status(200).json({
        message: "Task deleted successfully",
      });
    }
  });
};
