const Workspace = require("../models/Workspace");
const User = require("../models/User");

exports.createWorkspace = (req, res) => {
  const { name, owner, description } = req.body;

  const newWorkspace = new Workspace({ name, owner, description });
  let members = [];
  members.push(owner);
  newWorkspace.members = members;

  /**
   *   1. Checks if owner owns a workspace with same name [ YES: return status 405]
   *   2. create a new workspace
   *   3. find user and insert workspace inside user's workspace field
   *   4. return status 200
   */

  Workspace.findOne(
    { $and: [{ name: name }, { owner: owner }] },
    (err, workspace) => {
      if (workspace) {
        return res.status(405).json({
          error: "Workspace with same name already exists",
        });
      } else {
        newWorkspace.save((err, workspace) => {
          if (err) {
            return res.status(400).json({
              error: "Unexpected error",
            });
          } else {
            User.findOne({ _id: owner }, (err, user) => {
              if (err) {
                return res.status(400).json({
                  error: "Unexpected error",
                });
              } else {
                if (user.workspaces) user.workspaces.push(workspace._id);
                else {
                  let workspaces = [];
                  workspaces.push(workspace._id);
                  user.workspaces = workspaces;
                }
                user.save((err, user) => {
                  if (err) {
                    return res.status(400).json({
                      error: "Unexpected error",
                    });
                  } else {
                    return res.status(200).json({
                      message: "Workspace created successfully",
                      newWorkspace: workspace,
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

exports.deleteWorkspace = (req, res) => {
  const workspaceId = req.body.workspaceId;

  Workspace.findOne({ _id: workspaceId }, (err, workspace) => {
    if (err) {
      return res.status(400).json({
        error: "Unexpected error",
      });
    } else if (!workspace) {
      return res.status(404).json({
        error: "Workspace not found",
      });
    } else {
      const teams = workspace.teams;
      teams.forEach((team, index) => {
        //TODO: add deleteTeam functionality
      });

      const members = workspace.members;
      members.forEach((user, index) => {
        //TODO: Delete workspace id from user's workspaces array
      });

      Workspace.findOneAndDelete({ _id: workspaceId }, (err) => {
        if (err) {
          return res.status(400).json({
            error: "Unexpected error while deleting workspace",
          });
        } else {
          return res.status(200).json({
            message: "Workspace deleted successfully",
          });
        }
      });
    }
  });
};

exports.getWorkspaceById = (req, res) => {
  const wid = req.body.wid;
  Workspace.findOne({ _id: wid })
    .populate("teams")
    .populate("members", "firstname username email skypeId")
    .exec((err, workspace) => {
      if (err || !workspace) {
        return res.status(400).json({
          error: "Workspace not found",
          id: wid,
        });
      } else {
        return res.status(200).json({
          workspace: workspace,
        });
      }
    });
};

exports.addMembersToWorkspace = (req, res) => {
  /**
   * TODO: Check if isAuthenticated to add member [must be a owner]
   */

  const { wid, members, userId } = req.body;

  Workspace.findOne({ _id: wid }).exec(async (err, workspace) => {
    if (err || !workspace) {
      return res.status(400).json({
        error: "Workspace not found",
      });
    } else if (workspace.owner != userId) {
      return res.status(401).json({
        owner: workspace.owner,
        user: userId,
        error: "Unauthorized",
      });
    } else {
      let newMembers = workspace.members;

      /** First complete this */
      members.forEach(function (member) {
        User.findOne({
          $or: [{ email: member }, { username: member }],
        }).exec((err, user) => {
          if (user) {
            if (!workspace.members.includes(user._id)) {
              user.workspaces.push(workspace._id);
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
      workspace.members = newMembers;
      workspace.save((err, workspace) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        } else {
          return res
            .status(200)
            .json({ workspace: workspace, message: "Successfully Added!" });
        }
      });
    }
  });
};
