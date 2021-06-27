const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");
const Workspace = require("../models/Workspace");

exports.createTeam = (req, res) => {
  const { name, owner, wid, inviteLink } = req.body;
  let teamLeader = req.body.teamLeader;
  const newTeam = new Team({ ...req.body, teamLeader: owner });
  let members = [];
  members.push(owner);
  if (teamLeader && teamLeader.length > 0 && teamLeader !== owner)
    members.push(teamLeader);
  newTeam.members = members;

  /**
   *   1. Checks if owner owns a workspace with same name [ YES: return status 405]
   *   2. create a new workspace
   *   3. find user and insert workspace inside user's workspace field
   *   4. return status 200
   */

  // TODO: Break into smaller pieces ?

  Team.findOne({ $and: [{ name: name }, { workspace: wid }] }, (err, teamP) => {
    if (teamP) {
      return res.status(405).json({
        error: "Team with same name already exists",
      });
    } else {
      // Create new team
      newTeam.save((err, team) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            error: "Unexpected error while creating team",
          });
        } else {
          // Add team to Owner
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
                  // Add team to teamLeader
                  if (
                    teamLeader &&
                    teamLeader.length > 0 &&
                    teamLeader !== owner
                  ) {
                    User.findOne({ _id: teamLeader }, (err, user) => {
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
                              error: "UNexpected error while updating user",
                            });
                          }
                        });
                      }
                    });
                  }

                  // Add team to Worskspace
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
  });
};

/**
 * Fetch team by ID.
 * @param {String} req Query paramter - Team id
 * @param {Response} res - Team on success
 */
exports.getTeamById = (req, res) => {
  const tid = req.query.tid;
  Team.findOne({ _id: tid })
    .populate("tasks")
    .populate({
      path: "tasks",
      populate: {
        path: "membersAssigned",
      },
    })
    .populate("members", "firstname lastname username email skypeId image")
    .exec((err, team) => {
      if (err || !team) {
        return res.status(400).json({
          error: "Team not found",
          id: tid,
        });
      } else {
        return res.status(200).json({
          team: team,
        });
      }
    });
};

exports.hideTeam = (req, res) => {
  const teamId = req.body.teamId;
  const userId = req.body.userId;

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
    if (userId == team.owner) {
      team.hidden = true;
      team.save((err, team) => {
        if (err) {
          return res.status(400).json({
            error: "Failed to hide team",
            id: teamId,
          });
        } else {
          return res.status(200).json({
            team: team,
            message: "Team hidden successfully",
          });
        }
      });
    } else {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
  });
};

/**
 * Add new members to team, iff requesting user (identified by [userId]) is owner or Team Leader,
 * and user already is a part of the workspace.
 *
 * @param {object} req - Workspace Id, Team Id, members, userId
 * @param {Response} res - Updated Team
 */
exports.addMembersToTeam = (req, res) => {
  const { wid, tid, members, userId } = req.body;

  Workspace.findById({ _id: wid }).exec((err, workspace) => {
    if (err || !workspace) {
      return res.status(400).json({
        error: "Workspace not found!",
      });
    } else {
      // *************
      Team.findOne({ _id: tid }).exec(async (err, team) => {
        if (err || !team) {
          return res.status(400).json({
            error: "Team not found!",
          });
        } else if (team.owner != userId && team.teamLeader != userId) {
          return res.status(401).json({
            error: "Unauthorized",
          });
        } else {
          let newMembers = team.members;

          /** First complete this */
          members.forEach(function (member) {
            User.findOne({
              $or: [{ email: member }, { username: member }],
            }).exec((err, user) => {
              if (user) {
                // Checking that user must be a part of the Workspace && must not be present already in that team
                if (
                  workspace.members.includes(user._id) &&
                  !team.members.includes(user._id)
                ) {
                  user.teams.push(team._id);
                  user.save((err, user) => {
                    if (user) {
                      newMembers.push(user._id);
                    }
                  });
                }
              }
            });
          });

          //TODO: Look for better options to make code synchronous
          await new Promise((r) => setTimeout(r, 2000));

          /** Run after running above loop */
          team.members = newMembers;
          team.save((err, team) => {
            if (err) {
              return res.status(400).json({ error: err.message });
            } else {
              // Popluate the [members] field in team.
              team.populate(
                "members",
                "firstname lastname username email skypeId image",
                function (err, populatedTeam) {
                  if (err) {
                    return res.status(400).json({ error: err.message });
                  } else {
                    return res.status(200).json({
                      team: populatedTeam,
                      message: "Successfully Added!",
                    });
                  }
                }
              );
            }
          });
        }
      });
      // *****************
    }
  });
};

exports.makeTeamLeader = (req, res) => {
  // TODO: Take requesting userId as input to check authorization
  const { tid, memberId } = req.body;

  Team.findOne({ _id: tid }).exec((err, team) => {
    if (err || !team) {
      return res.status(400).json({ error: "Team not found!" });
    } else {
      const { owner, teamLeader } = team;
      if (memberId === owner || memberId === teamLeader) {
        return res.status(400).json({
          error: "User is not a member. Cannot change to Team Leader.",
        });
      } else {
        // Change the teamLeader
        team.teamLeader = memberId;

        team.save((err, updatedTeam) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          } else {
            // Popluate the [members] field in team.
            team.populate(
              "members",
              "firstname lastname username email skypeId image",
              function (err, populatedTeam) {
                if (err) {
                  return res.status(400).json({ error: err.message });
                } else {
                  return res.status(200).json({
                    team: populatedTeam,
                    message: "Successfully changed the Team Leader!",
                  });
                }
              }
            );
          }
        });
      }
    }
  });
};

/**
 * Update Name for a team.
 * @param {Object} req - Team id(tid), name
 * @param {Response} res
 */
exports.updateTeamDetails = (req, res) => {
  // TODO: Add authentication for confirming the validity of the operation

  const { tid, name } = req.body;
  Team.findOne({ _id: tid }).exec((err, team) => {
    if (err || !team) {
      return res.status(200).json({ error: "Team not found!" });
    } else {
      team.name = name;
      team.save((err, updatedTeam) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        } else {
          // Popluate the [members] field in team.
          updatedTeam.populate(
            "members",
            "firstname lastname username email skypeId image",
            function (err, populatedTeam) {
              if (err) {
                return res.status(400).json({ error: err.message });
              } else {
                return res.status(200).json({
                  team: populatedTeam,
                  message: "Successfully updated team!",
                });
              }
            }
          );
        }
      });
    }
  });
};
