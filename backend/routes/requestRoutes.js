const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const Request = require("../models/Request");

const router = express.Router();

router.get("/", async (req, res) => {
  const { page = 1, limit = 4, location = "", sort = "desc" } = req.query;

  try {
    const query = location ? { location: { $regex: location, $options: "i" } } : {};

    const sortOrder = sort === "asc" ? 1 : -1;

    const requests = await Request.find(query)
      .populate("requester", "name email")
      .sort({ createdAt: sortOrder })  // Sort by creation date
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalRequests = await Request.countDocuments(query);

    res.json({
      requests,
      totalRequests,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRequests / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const requestItem = await Request.findById(req.params.id).populate("requester", "name email");
    if (!requestItem) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json(requestItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, description, location } = req.body;
  try {
    const request = new Request({ title, description, location, requester: req.user.id });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Запит видалено" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/toggle-activation", authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Запит не знайдено" });

    request.isActive = !request.isActive; 
    await request.save();

    res.json({ message: `Запит ${request.isActive ? "активовано" : "деактивовано"}`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
