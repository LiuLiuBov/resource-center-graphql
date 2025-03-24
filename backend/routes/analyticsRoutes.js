const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const Request = require("../models/Request");
const User = require("../models/User");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      // Total Users
      const totalUsers = await User.countDocuments();
  
      // Total Active and Inactive Requests
      const activeRequests = await Request.countDocuments({ isActive: true });
      const deactivatedRequests = await Request.countDocuments({ isActive: false });
  
      // Requests per location
      const locationStats = await Request.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } }
      ]);
  
      // Requests status
      const statusStats = [
        { status: "Active", count: activeRequests },
        { status: "Deactivated", count: deactivatedRequests },
      ];
  
      res.json({
        totalUsers,
        activeRequests,
        deactivatedRequests,
        locationStats,
        statusStats,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.get("/requests-status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const activeCount = await Request.countDocuments({ isActive: true });
    const inactiveCount = await Request.countDocuments({ isActive: false });
    res.json({ activeCount, inactiveCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requests-location", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requestsByLocation = await Request.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } }
    ]);
    res.json(requestsByLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/total-users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requests-per-user", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requestsPerUser = await Request.aggregate([
      { $group: { _id: "$requester", count: { $sum: 1 } } },
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $project: { count: 1, "userInfo.name": 1, "userInfo.email": 1 } }
    ]);
    res.json(requestsPerUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
