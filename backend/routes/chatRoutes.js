const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const ChatMessage = require("../models/chatMessage");

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  try {
    const messages = await ChatMessage.find({ request: requestId })
      .populate("author", "name email")
      .sort({ createdAt: 1 }); 
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message content is required." });
  }
  
  try {
    const chatMessage = new ChatMessage({
      request: requestId,
      author: req.user.id,
      message,
    });
    await chatMessage.save();
    
    await chatMessage.populate("author", "name email");
    
    res.status(201).json(chatMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
