// models/chatMessage.js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
