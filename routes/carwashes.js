// routes/carwashes.js
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const CarWash = require("../models/CarWash");

// GET /api/carwashes?service_id=<id>
router.get("/", async (req, res) => {
  try {
    const { service_id } = req.query;
    if (!service_id) {
      return res
        .status(400)
        .json({ message: "Missing required query param: service_id" });
    }

    // 1. Φέρνουμε το service για να διαβάσουμε το car_wash_id
    const service = await Service.findById(service_id).lean();
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Φέρνουμε το CarWash με βάση το ObjectId που έχει στο service.car_wash_id
    const carwash = await CarWash.findById(service.car_wash_id, {
      name: 1,
      address: 1,
      city: 1,
      state: 1,
      zip_code: 1,
      phone_number: 1,
      working_hours: 1,
    }).lean();

    if (!carwash) {
      return res.status(404).json({ message: "CarWash not found" });
    }

    // 3. Επιστρέφουμε ένα array με ένα single αντικείμενο (για ευκολία στο front)
    res.json([carwash]);
  } catch (err) {
    console.error("Error in GET /api/carwashes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
