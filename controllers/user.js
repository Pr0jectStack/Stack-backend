const User = require("../models/User");

exports.getUserById = (req, res) => {
  const userId = req.query.userId;
  User.findById(userId)
    .lean()
    .populate("workspaces")
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

exports.updateUserProfile = (req, res) => {
  const userId = req.query.userId;
  const { bio, socialMediaHandles } = req.body;

  User.findByIdAndUpdate(userId, { bio, socialMediaHandles }, { new: true })
    .populate("workspaces")
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

    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Old password is incorrect!",
      });
    }

    user.password = new_password;

    user.save((err, user) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: err });
      }
      user.encrypted_password = null;
      user.salt = null;
      user.updatedAt = null;
      return res.status(200).json({ message: user });
    });
  });
};
