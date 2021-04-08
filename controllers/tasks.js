"use strict";

const Team = require("../models/Team");
const Task = require("../models/Task");
const User = require("../models/User");

/**
 * Add new task inside a team.
 * @param {object} req - Object containing tasks, teamId and the userId
 * @param {JSON} res - Failure/Success message
 */
exports.addTask = (req, res) => {
  let {
    tid,
    userId,
    taskName,
    taskDescription,
    deadline,
    category,
    priority,
    status,
    membersAssigned,
    assignedBy,
  } = req.body;

  const task = new Task({
    taskName,
    taskDescription,
    deadline,
    category,
    priority,
    status,
    membersAssigned,
    assignedBy,
  });

  Team.findById({ _id: tid }).exec(async (err, team) => {
    if (err || !team) {
      return res.status(400).json({
        error: "Team not found!",
      });
    } else if (!userId) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else if (
      userId &&
      team.owner.toString() !== userId.toString() &&
      team.teamLeader.toString() !== userId.toString()
    ) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else {
      let newMembersAssigned = [];

      membersAssigned.forEach((member) => {
        User.findOne({
          $or: [{ email: member }, { username: member }],
        }).exec((err, user) => {
          if (user) {
            if (team.members.includes(user._id)) {
              newMembersAssigned.push(user._id);
            }
          }
        });
      });

      // ! TODO: Look for better options to make code synchronous
      await new Promise((r) => setTimeout(r, 2000));

      task.membersAssigned = newMembersAssigned;

      task.save((err, newTask) => {
        if (err) {
          return res.status(400).json({ error: "Cannot create task" });
        } else {
          // Add newly created task to teams.
          team.tasks.push(newTask._id);

          team.save((err, updatedTeam) => {
            if (err) {
              // Remove newly created task.
              Task.findByIdAndDelete(newTask._id).exec((err, deletedTask) => {
                if (err) {
                  // console.log(err);
                } else {
                  // console.log("SUCCESS");
                }
              });
              return res.status(400).json({ error: "Cannot create task." });
            } else {
              // Populate Tasks
              updatedTeam.populate("tasks").populate(
                {
                  path: "tasks",
                  populate: {
                    path: "membersAssigned",
                  },
                },
                function (err, team) {
                  return res.status(200).json({
                    team: team,
                    tasks: team.tasks,
                  });
                }
              );
            }
          });
        }
      });
    }
  });
};

/**
 * Edit Task fields - taskName, taskDescription, deadline, category, priority, status.
 * @param {object} req - Task model, task Id
 * @param {JSON} res - Success/Failure indication
 */
exports.editTask = (req, res) => {
  const {
    taskId,
    taskName,
    taskDescription,
    deadline,
    category,
    priority,
    status,
    tid,
    userId,
  } = req.body;

  let editTaskFields = {};
  if (taskName) {
    editTaskFields = {
      ...editTaskFields,
      taskName,
    };
  }
  if (taskDescription) {
    editTaskFields = {
      ...editTaskFields,
      taskDescription,
    };
  }
  if (deadline) {
    editTaskFields = {
      ...editTaskFields,
      deadline,
    };
  }
  if (priority) {
    editTaskFields = {
      ...editTaskFields,
      priority,
    };
  }
  if (category) {
    editTaskFields = {
      ...editTaskFields,
      category,
    };
  }
  if (status) {
    editTaskFields = {
      ...editTaskFields,
      status,
    };
  }

  Team.findById({ _id: tid }).exec((err, team) => {
    if (err || !team) {
      return res.status(400).json({
        error: "Team not found!",
      });
    } else if (!userId) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else if (
      userId &&
      team.owner.toString() !== userId.toString() &&
      team.teamLeader.toString() !== userId.toString()
    ) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else {
      // Update the task in the database.
      Task.findByIdAndUpdate(taskId, { ...editTaskFields }, { new: true }).exec(
        (err, newTask) => {
          if (err || !newTask) {
            return res
              .status(400)
              .json({ error: "Cannot update task right now." });
          } else {
            Team.findById(tid)
              .populate("tasks")
              .populate({
                path: "tasks",
                populate: {
                  path: "membersAssigned",
                },
              })
              .exec((err, team) => {
                if (err) {
                  // console.log(err);
                }
                return res.status(200).json({ team: team, tasks: team.tasks });
              });
          }
        }
      );
    }
  });
};

/**
 * Move task from source column to destination column.
 * @param {object} req - TaskId, and destination column
 * @param {JSON} res - Success/Failure message
 */
exports.moveTask = (req, res) => {
  const { taskId, destination, tid } = req.body;
  let status = destination;
  Task.findByIdAndUpdate(taskId, { status }, { new: true }).exec(
    (err, newTask) => {
      if (err) {
        return res.status(400).json({ error: "Cannot move task right now!" });
      } else {
        Team.findById(tid)
          .populate("tasks")
          .populate({
            path: "tasks",
            populate: {
              path: "membersAssigned",
            },
          })
          .exec((err, team) => {
            if (err) {
              // console.log(err);
            }
            return res.status(200).json({ team: team, tasks: team.tasks });
          });
      }
    }
  );
};

/**
 * Assign new members to task.
 * @param {object} req - taskId, tid, userId, members
 * @param {JSON} res - Sucess/Failure indication
 */
exports.assignMembersToTask = (req, res) => {
  const { taskId, tid, userId, members } = req.body;

  Team.findById(tid).exec(async (err, team) => {
    if (err || !team) {
      return res.status(400).json({
        error: "Team not found!",
      });
    } else if (!userId) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else if (
      userId &&
      team.owner.toString() !== userId.toString() &&
      team.teamLeader.toString() !== userId.toString()
    ) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else {
      let newMembersAssigned = [];

      members.forEach((member) => {
        User.findOne({
          $or: [{ email: member }, { username: member }],
        }).exec((err, user) => {
          if (user) {
            if (team.members.includes(user._id)) {
              newMembersAssigned.push(user._id);
            }
          }
        });
      });

      // ! TODO: Look for better options to make code synchronous
      await new Promise((r) => setTimeout(r, 2000));

      if (newMembersAssigned.length <= 0) {
        return res.status(400).json({ error: "Cannot add any team member." });
      }

      Task.findByIdAndUpdate(
        taskId,
        {
          $addToSet: { membersAssigned: { $each: newMembersAssigned } },
        },
        { new: true }
      ).exec((err, updatedTask) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Cannot assign members to task right now" });
        } else {
          Team.findById(tid)
            .populate("tasks")
            .populate({
              path: "tasks",
              populate: {
                path: "membersAssigned",
              },
            })
            .exec((err, team) => {
              if (err) {
                // console.log(err);
              }
              return res.status(200).json({ team: team, tasks: team.tasks });
            });
        }
      });
    }
  });
};

/**
 * Remove members from task.
 * @param {object} req - taskId, tid, userId, members
 * @param {JSON} res - Sucess/Failure indication
 */
exports.removeMembersFromTask = (req, res) => {
  const { taskId, tid, userId, members } = req.body;

  Team.findById(tid).exec((err, team) => {
    if (err || !team) {
      return res.status(400).json({
        error: "Team not found!",
      });
    } else if (team.owner != userId && team.teamLeader != userId) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else {
      Task.findById(taskId).exec((err, task) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Cannot remove members from task right now" });
        } else {
          // Filter out the members.
          let newMembers = task.membersAssigned.filter(
            (member) => !members.includes(member.toString())
          );
          task.membersAssigned = newMembers;

          task.save((err, updatedTask) => {
            if (err) {
              return res.status(400).json({
                error: "Cannot remove membersd frrom task right now",
              });
            } else {
              return res.status(200).json({ task: updatedTask });
            }
          });
        }
      });
    }
  });
};

/**
 * Delete task.
 * @param {object} req - taskId, tid, userId
 * @param {JSON} res - Success/Failure indication
 */
exports.deleteTask = (req, res) => {
  const { taskId, tid, userId } = req.body;

  Team.findById(tid).exec((err, team) => {
    if (err || !team) {
      return res.status(400).json({
        error: "Team not found!",
      });
    } else if (!userId) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else if (
      team.owner.toString() !== userId.toString() &&
      team.teamLeader.toString() !== userId.toString()
    ) {
      return res.status(401).json({
        error: "Unauthorized request.",
      });
    } else {
      // Remove task from tteam
      let tasks = team.tasks.filter((task) => task != taskId);
      team.tasks = tasks;
      team.save((err, updatedTeam) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Cannot remove tasks from team right now" });
        } else {
          Task.findByIdAndDelete(taskId).exec((err, deletedTask) => {
            if (err) {
              // console.log(err);
            } else {
              // console.log("SUCCESS");
            }
          });
          // Populate Tasks
          updatedTeam.populate("tasks").populate(
            {
              path: "tasks",
              populate: {
                path: "membersAssigned",
              },
            },
            function (err, team) {
              return res.status(200).json({
                team: team,
                tasks: team.tasks,
              });
            }
          );
        }
      });
    }
  });
};
