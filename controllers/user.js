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
  const userData = req.body.data;
  User.findByIdAndUpdate(userId, { ...userData }, function (err, docs) {
    if (err) {
      return res.status(400).json({
        error: "Some error occured! Cannot update profile at this time!",
      });
    } else {
      return res.status(200).json({ message: "Profile updated successfully!" });
    }
  });
};
