const fs = require("fs");
const { IncomingForm } = require("formidable");
const User = require("../models/User");

/**
 *  GET user by ID.
 * @param {string} req - user Id.
 * @param {json} res - user object
 */
exports.getUserById = (req, res) => {
  const userId = req.query.userId;
  User.findById(userId)
    .lean()
    .populate({
      path: 'workspaces',
      match: { deleted: false }
    })
    .populate({
      path: 'teams',
      match: { deleted: false }
    })
    .exec((err, user) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "Error occured! Cannot fetch user!" });
      } else {
        delete user.encrypted_password;
        delete user.salt;
        delete user.updatedAt;
        return res.status(200).json(user);
      }
    });
};

/**
 *  Update user bio and socialMediaHandles.
 * @param {object} req - Object containing bio and socialMediaHandles
 * @param {json} res - user object
 */
exports.updateUserProfile = (req, res) => {
  const userId = req.query.userId;
  const { bio, socialMediaHandles } = req.body;

  User.findByIdAndUpdate(userId, { bio, socialMediaHandles }, { new: true })
  .populate({
    path: 'workspaces',
    match: { deleted: false }
  })
  .populate({
    path: 'teams',
    match: { deleted: false }
  })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Some error occured! Cannot update profile at this time!",
        });
      } else {
        data.encrypted_password = null;
        data.salt = null;
        data.updatedAt = null;
        return res.status(200).json({ data: data });
      }
    });
};
/**
 *  Update user Password.
 * @param {object} req - Object containing old and new password.
 * @param {json} res - user object
 */
exports.updateUserPassword = (req, res) => {
  const userId = req.query.userId;
  const { password, new_password } = req.body;

  if (password === new_password) {
    return res
      .status(400)
      .json({ error: "Old password cannot be equal to the new password" });
  }

  User.findById(userId).exec((err, user) => {
    if (err) {
      return res.status(400).json({ error: err });
    }

    else if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Old password is incorrect!",
      });
    }

    else{
      user.password = new_password;

      user.save((err, user) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ error: err });
        }
        // TODO: DONT SEND HIDDEN TEAMS/WORKSPACES
        // user
        // .populate({
        //   path: 'workspaces',
        //   match: { deleted: false }
        // })
        // .populate({
        //   path: 'teams',
        //   match: { deleted: false }
        // })
        // .exec((err,user)=>{
        //   user.encrypted_password = null;
        //   user.salt = null;
        //   user.updatedAt = null;
        //   return res.status(200).json({ data: user });
        // });
        user.populate("workspaces teams", function (err, user) {
          user.encrypted_password = null;
          user.salt = null;
          user.updatedAt = null;
          return res.status(200).json({ data: user });
        });
      });
    }
  });
};

// ! TODO: Add File Size to Image.

/**
 *  Update user image.
 * @param {form} req - Form data containing image data.
 * @param {json} res - user object
 */
exports.updateUserImage = (req, res) => {
  const userId = req.query.userId;

  let form = new IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "Some Error Occured. Cannot upload image at this time.",
        message: err,
      });
    } else {
      const newImage = file.image;
      User.findById(userId).exec((err, user) => {
        if (err) {
          return res.status(400).json({
            error:
              "Some error occured! Cannot update the user image right now.",
          });
        } else {
          if (
            newImage.type !== "image/jpeg" &&
            newImage.type !== "image/jpg" &&
            newImage.type !== "image/png"
          ) {
            return res
              .status(400)
              .json({ error: "Invalid Format! Try again with another image." });
          }

          user.image.data = fs.readFileSync(newImage.path);
          user.image.contentType = newImage.type;
          user.save((err, user) => {
            if (err) {
              return res.status(400).json({
                error: "Some error occured! Cannot update the image right now.",
                message: err,
              });
            } else {
              //TODO: DONT SEND HIDDEN WORKSPACES/TEAMS
              user.populate("workspaces teams", function (err, updatedUser) {
                updatedUser.encrypted_password = null;
                updatedUser.salt = null;
                updatedUser.updatedAt = null;
                return res.status(200).json({ data: updatedUser });
              });
            }
          });
        }
      });
    }
  });
};
