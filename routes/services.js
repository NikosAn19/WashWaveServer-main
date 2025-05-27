// routes/services.js
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET  /api/services
// returns all services, newest first
router.get("/", async (req, res) => {
  try {
    // find all, sort descending by creation date
    const services = await Service.find()
      .sort({ created_at: -1 })
      // if you also want the CarWash name/address etc:
      // .populate("car_wash_id", "name address")
      ;
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Server error fetching services." });
  }
});

module.exports = router;
