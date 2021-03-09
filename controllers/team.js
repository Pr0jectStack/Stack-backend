const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");

exports.deleteTeam = (req, res) => {
  const teamId = req.body.teamId;

  Team.findOne({ _id: teamId }, (err, team) => {
    if (err) {
      return res.status(400).json({
        error: "Unexpected error",
      });
    }
    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const members = team.members;
    members.forEach((user, index) => {
      //TODO: Delete workspace id from user's teams array
    });

    const tasks = workspace.tasks;
    tasks.forEach((task, index) => {
      //TODO: remove tasks functionality
    });

    Team.findOneAndDelete({ _id: teamId }, (err) => {
      if (err) {
        return res.status(400).json({
          error: "Unexpected error while deleting Team",
        });
      } else {
        return res.status(200).json({
          message: "Team deleted successfully",
        });
      }
    });
  });
};
