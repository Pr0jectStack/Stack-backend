"use strict";

const { lowerFirst } = require("lodash");
const Chat = require("../models/Chat");

/**
 * Add new chat to the database.
 * @param {object} req - JS object containing chatId, message, userId, username
 * @param {Response} res - Error Message/Sent Chat
 */
exports.addChat = (req, res) => {
  const { chatId, message, userId, username } = req.body;
  const chat = new Chat({
    chatId,
    message,
    userId,
    username,
  });

  chat.save((err, newChat) => {
    if (err) {
      return res.status(400).json({ error: "Cannot send message right now!" });
    } else {
      Chat.find({ chatId: chatId })
        .sort("createdAt")
        .exec((err, chats) => {
          if (err) {
            console.log(err);
            return res
              .status(400)
              .message({ error: "Cannot add chat right now!" });
          } else {
            return res.status(200).json({ chats: chats });
          }
        });
    }
  });
};

/**
 * Fetch all Chats with same {chatId}
 * @param {string} req - Chat Id
 * @param {Response} res - Error Message / Chats
 */
exports.fetchChatMessages = (req, res) => {
  const chatId = req.query.chatId;
  Chat.find({ chatId: chatId })
    .sort("createdAt")
    .exec((err, chats) => {
      if (err) {
        return res.status(400).json({ error: "Cannot fetch chats right now!" });
      } else {
        return res.status(200).json({ chats: chats });
      }
    });
};
