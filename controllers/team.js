const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");
const Workspace = require("../models/Workspace");

exports.createTeam = (req, res) => {
  const { name, owner,wid,inviteLink } = req.body;

  const newTeam = new Team({ name, owner,inviteLink });
  let members = [];
  members.push(owner);
  newTeam.members = members;

  /**
   *   1. Checks if owner owns a workspace with same name [ YES: return status 405]
   *   2. create a new workspace
   *   3. find user and insert workspace inside user's workspace field
   *   4. return status 200
   */

  Team.findOne(
    { $and: [{ name: name }, { workspace: wid }] },
    (err, teamP) => {
      if (teamP) {
        return res.status(405).json({
          error: "Team with same name already exists",
        });
      } else {
        newTeam.save((err, team) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              error: "Unexpected error while creating team",
            });
          } else {
            User.findOne({ _id: owner }, (err, user) => {
              if (err) {
                return res.status(400).json({
                  error: "Unexpected error while finding user",
                });
              } else {
                if (user.teams) user.teams.push(team._id);
                else {
                  let teams = [];
                  teams.push(team._id);
                  user.teams = teams;
                }
                user.save((err, user) => {
                  if (err) {
                    return res.status(400).json({
                      error: "Unexpected error while updating user",
                    });
                  } else {
                    Workspace.findOne({ _id: wid }, (err, workspace) => {
                      if (err || !workspace) {
                        return res.status(400).json({
                          error: "Unexpected error while finding workspace",
                        });
                      } else {
                        if (workspace.teams) workspace.teams.push(team._id);
                        else {
                          let teams2 = [];
                          teams2.push(team._id);
                          workspace.teams = teams2;
                        }
                        workspace.save((err, workspace) => {
                          if (err || !workspace) {
                            return res.status(400).json({
                              error: "Unexpected error while saving workspace",
                            });
                          } else {
                            return res.status(200).json({
                              message: "Team created successfully",
                              newTeam: team,
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  );
};

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