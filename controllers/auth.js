const User = require("../models/User");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const secret = process.env.SECRET;

const replaceDot = (token) => {
  let newToken = "";

  for (let i = 0; i < token.length; i++) {
    let ch = token[i];
    if (ch === ".") {
      ch = "*";
    }
    newToken = newToken + ch;
  }
  return newToken;
};

const replaceMul = (token) => {
  let newToken = "";
  for (let i = 0; i < token.length; i++) {
    let ch = token[i];
    if (ch === "*") {
      ch = ".";
    }
    newToken = newToken + ch;
  }
  return newToken;
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      parameter: errors.array()[0].param,
    });
  }

  const { username_email, password } = req.body;
  let username = username_email;
  User.findOne({
    $or: [{ email: username }, { username: username }],
  })
    .populate("workspaces")
    .populate("teams")
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: "User not found!" });
      }

      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Username and password do not match!",
        });
      }

      // Create Token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);

      //Put token in cookie
      res.cookie("token", token, { expire: new Date() + 30 });

      const profile = user;
      profile.salt = null;
      profile.encrypted_password = null;
      profile.updatedAt = null;

      //Send response to Front End
      return res.status(200).json({
        message: "User signed in successfully!",
        token: token,
        user: user,
      });
    }
  );
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User signed out successfully!" });
};

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      parameter: errors.array()[0].param,
    });
  }

  const user = new User(req.body);

  const { email, password, firstName, lastName, username } = user;

  User.findOne({ email }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: "User already exists!",
      });
    }

    let token = jwt.sign(
      { email, password, firstName, lastName, username },
      process.env.ACTIVATION_KEY,
      { expiresIn: "15m" }
    );

    token = replaceDot(token);

    // let newUser = new User({
    //   email,
    //   password,
    //   firstName,
    //   lastName,
    //   username,
    // });

    // newUser.save((err, user) => {
    //   if (err) {
    //     return res.status(400).json({ error: err.message });
    //   }
    //   return res.status(200).json({
    //     name: user.firstName,
    //     email: user.email,
    //     username: user.username,
    //   });
    // });

    //TODO: Verification Link

    //   let token = jwt.sign(
    //     { email, password, firstName, lastName, gender },
    //     process.env.ACTIVATION_KEY,
    //     { expiresIn: "15m" }
    //   );

    //   token=replaceDot(token);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email, // Change to your recipient
      from: "theberrytree.org@gmail.com", // Change to your verified sender
      subject: "Collab: Account Activation Link",
      html: `
            <h2>Activate your account</h2>
            <p>Click this link to confirm your email address and complete setup for your account</p>
            <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
            <p>This link will expire in 15 minutes</p>
            <h6>Team Collab</h6>
          `,
    };
    sgMail
      .send(msg)
      .then(() => {
        return res.status(200).json({
          message: "Verification Link Sent Successfully",
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: error,
        });
      });
  });
};

exports.usernameAvailability = (req, res) => {
  const username = req.body.username;
  // console.log(username);
  User.findOne(
    {
      $or: [
        {
          email: username,
        },
        {
          username: username,
        },
      ],
    },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Unexpected Error!",
        });
      }
      if (!user) {
        return res.status(200).json({
          message: "Username or Email Available",
        });
      } else {
        return res.status(200).json({
          error: "Username or email already taken",
        });
      }
    }
  );
};

exports.verifyEmail = (req, res) => {
  let token = req.query.token;

  token = replaceMul(token);

  if (token) {
    jwt.verify(token, process.env.ACTIVATION_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(400).json({
          error: "Token invalid !" + token,
        });
      }
      const { email, password, firstName, lastName, username } = decodedToken;

      // console.log(
      //   "Inside Verify " +
      //     email +
      //     " " +
      //     password +
      //     " " +
      //     firstName +
      //     " " +
      //     lastName+
      //     " "+
      //     username
      // );

      User.findOne({ email }, (err, user) => {
        if (user) {
          return res.status(400).json({
            error: "User already exists!",
          });
        }

        let newUser = new User({
          email,
          password,
          firstName,
          lastName,
          username,
        });

        newUser.save((err, user) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }
          return res.status(200).json({
            name: user.firstName,
            email: user.email,
            username: user.username,
          });
        });
      });
    });
  } else {
    return res.status(400).json({
      error: "Token invalid !",
    });
  }
};


exports.forgotPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      parameter: errors.array()[0].param,
    });
  }

  const { email } = req.body;
  // console.log(email);
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User does not exists!",
      });
    }

    let token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "15m",
    });

    const newToken =token;
    token=replaceDot(token);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email, // Change to your recipient
      from: "theberrytree.org@gmail.com", // Change to your verified sender
      subject: "Collab: Password Reset Link",
      html: `
            <h2>Reset your password</h2>
            <p>Click this link to change your password</p>
            <p>${process.env.CLIENT_URL}/reset/password/${token}</p>
            <p>This link will expire in 15 minutes</p>
            <h6>Team Collab</h6>
          `,
    };

    return user.updateOne({ resetLink: newToken }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "reset password link error",
        });
      } else {
        sgMail
          .send(msg)
          .then(() => {
            return res.status(200).json({
              message: "Reset Link Sent Successfully",
            });
          })
          .catch((error) => {
            return res.status(400).json({
              error: error,
            });
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      parameter: errors.array()[0].param,
    });
  }

  let { resetLink, newPass } = req.body;
  resetLink=replaceMul(resetLink);
  if (resetLink) {
    jwt.verify(
      resetLink,
      process.env.RESET_PASSWORD_KEY,
      (err, decodedData) => {
        if (err) {
          return res.status(400).json({
            error: "Incorrect token or it is expired",
          });
        }

        User.findOne({ resetLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "User with this token does not exist.",
            });
          }

          const obj = {
            password: newPass,
            resetLink: "",
          };

          user = _.extend(user, obj);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "reset password error",
              });
            } else {
              return res.status(200).json({
                message: "Your password has been changed",
              });
            }
          });
        });
      }
    );
  } else {
    return res.status(401).json({
      error: "Authentication error!!",
    });
  }
};