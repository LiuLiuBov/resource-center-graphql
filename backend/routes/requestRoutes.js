const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const Request = require("../models/Request");

const router = express.Router();

router.get("/", async (req, res) => {
  const { page = 1, limit = 4, location = "", sort = "desc", active, requester } = req.query;

  try {
    // Build the query object with optional filters
    const query = {
      ...(location && { location: { $regex: location, $options: "i" } }),
      ...(active === "true" && { isActive: true }),
      ...(active === "false" && { isActive: false }),
      ...(requester && { requester: requester }),
    };

    const sortOrder = sort === "asc" ? 1 : -1;

    // Fetch the filtered and sorted requests
    const requests = await Request.find(query)
      .populate("requester", "name email")
      .populate("volunteers", "name email profilePicture")
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get the total count of matching requests
    const totalRequests = await Request.countDocuments(query);

    // Respond with paginated data
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
    const requestItem = await Request.findById(req.params.id).populate("requester", "name email").populate("volunteers", "name email profilePicture role");
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
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("requester", "name email");
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
    let request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Запит не знайдено" });

    request.isActive = !request.isActive; 
    await request.save();

    request = await Request.findById(req.params.id).populate("requester", "name email");

    res.json({ message: `Запит ${request.isActive ? "активовано" : "деактивовано"}`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/accept", authMiddleware, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id).populate("requester", "name email");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.requester._id) === String(req.user.id) || req.user.role === "admin") {
      return res.status(403).json({ message: "Requester or Admin cannot accept the request" });
    }

    if (request.volunteers.includes(req.user.id)) {
      return res.status(400).json({ message: "User has already accepted this request" });
    }

    request.volunteers.push(req.user.id);
    await request.save();

    request = await Request.findById(req.params.id)
      .populate("requester", "name email")
      .populate("volunteers", "name email profilePicture role");

    res.json({ message: "Request accepted", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.patch("/:id/reject", authMiddleware, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id).populate("requester", "name email");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.volunteers = request.volunteers.filter(
      volunteerId => String(volunteerId) !== String(req.user.id)
    );
    await request.save();

    request = await Request.findById(req.params.id).populate("requester", "name email");

    res.json({ message: "Volunteer removed", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
