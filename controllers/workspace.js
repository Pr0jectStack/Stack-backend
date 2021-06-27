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

exports.hideWorkspace = (req, res) => {
  const wid = req.body.workspaceId;
  const uid = req.body.userId;

  Workspace.findOne({ _id: wid }).exec(async (err, workspace) => {
    if (uid == workspace.owner) {
      if (err || !workspace) {
        //Error
        return res.status(400).json({
          error: "Failed to find workspace",
          id: wid,
        });
      } else {
        workspace.hidden = true;
        workspace.save((err, workspace) => {
          if (err) {
            //Error
            return res.status(400).json({
              error: "Failed to hide workspace",
              id: wid,
            });
          } else {
            return res.status(200).json({
              workspace: workspace,
              message: "Workspace is hidden successfully",
            });
          }
        });
      }
    } else {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
  });
};

exports.restoreWorkspace = (req, res) => {
  const wid = req.body.workspaceId;
  const uid = req.body.userId;

  Workspace.findOne({ _id: wid }).exec(async (err, workspace) => {
    if (uid == workspace.owner) {
      if (err || !workspace) {
        //Error
        return res.status(400).json({
          error: "Failed to find workspace",
          id: wid,
        });
      } else {
        workspace.hidden = false;
        workspace.save((err, workspace) => {
          if (err) {
            //Error
            return res.status(400).json({
              error: "Failed to restore workspace",
              id: wid,
            });
          } else {
            return res.status(200).json({
              workspace: workspace,
              message: "Workspace has been restored successfully",
            });
          }
        });
      }
    } else {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
  });
};

/**
 * Fetch workspace by ID.
 * @param {String} req - Query paramter: Workspace ID
 * @param {Response} res - Workspace on success
 */
exports.getWorkspaceById = (req, res) => {
  const wid = req.query.wid;
  Workspace.findOne({ _id: wid })
    .populate({
      path: "teams",
      match: { hidden: false },
    })
    .populate("members", "firstname lastname username email skypeId image")
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

/**
 * Add new members to workspace, iff requesting userId === ownerId,
 * and user already has an account on the website.
 *
 * @param {object} req - Workspace Id, members, userId
 * @param {Response} res - Updated Workspace
 */
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
          // Populate the [members] and [teams] field in workspace.
          workspace
            .populate("teams")
            .populate(
              "members",
              "firstname lastname username email skypeId image",
              function (err, populatedWorkspace) {
                if (err) {
                  return res.status(400).json({ error: err });
                }
                return res.status(200).json({
                  workspace: populatedWorkspace,
                  message: "Successfully Added!",
                });
              }
            );
        }
      });
    }
  });
};

/**
 * Update Name and Description for a Workspace.
 * @param {Object} req - Workspace id(wid), name, description
 * @param {Response} res
 */
exports.updateWorkspaceDetails = (req, res) => {
  // TODO: Add authentication for confirming the validity of the operation

  const { wid, name, description } = req.body;
  Workspace.findOne({ _id: wid }).exec((err, workspace) => {
    if (err || !workspace) {
      return res.status(400).json({ error: "Workspace not found!" });
    } else {
      workspace.name = name;
      workspace.description = description;
      workspace.save((err, udpateWorksapce) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        } else {
          // Populate the [members] and [teams] field in workspace.
          updatedWorkspace
            .populate("teams")
            .populate(
              "members",
              "firstname lastname username email skypeId image",
              function (err, populatedWorkspace) {
                if (err) {
                  return res.status(400).json({ error: err });
                }
                return res.status(200).json({
                  workspace: populatedWorkspace,
                  message: "Successfully Updated workspace!",
                });
              }
            );
        }
      });
    }
  });
};

exports.getHiddenWorkspaces = (req, res) => {
  const userId = req.query.uid;

  Workspace.find({ owner: userId, hidden: true }).exec((err, workspaces) => {
    if (err || !workspaces) {
      return res.status(400).json({
        error: "No Workspaces not found",
      });
    } else {
      return res.status(200).json({
        workspaces: workspaces,
      });
    }
  });
};
