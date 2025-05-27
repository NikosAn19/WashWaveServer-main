// routes/history.js
const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const CarWash = require("../models/CarWash");
const Service = require("../models/Service");

// 1) Δημιουργία νέας κράτησης
//    Αναμένεται στο body: { user_email, vehicle_type, service_id, car_wash_id, reserved_at }
router.post("/", async (req, res) => {
  try {
    const { user_email, vehicle_type, service_id, car_wash_id, reserved_at } =
      req.body;
    if (
      !user_email ||
      !vehicle_type ||
      !service_id ||
      !car_wash_id ||
      !reserved_at
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const reservation = new Reservation({
      user_email,
      vehicle_type,
      service_id: service_id,
      car_wash_id: car_wash_id,
      reserved_at: new Date(reserved_at),
    });
    await reservation.save();
    res.status(201).json({ message: "Reservation saved.", reservation });
  } catch (err) {
    console.error("Error in POST /api/reservations:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Επιστρέφει όλες τις κρατήσεις του χρήστη με το δοσμένο email
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Missing email query parameter." });
    }

    const reservations = await Reservation.find({ user_email: email })
      .sort({ reserved_at: -1 })
      .populate("car_wash_id", "name") // κρατάμε μόνο το όνομα του πλυντηρίου
      .populate("service_id", "name price") // όνομα+τιμή της υπηρεσίας
      .lean();

    // διαμόρφωση απάντησης
    const result = reservations.map((r) => ({
      reservation_id: r._id,
      reserved_at: r.reserved_at,
      vehicle_type: r.vehicle_type,
      car_wash_name: r.car_wash_id.name,
      service: {
        name: r.service_id.name,
        price: r.service_id.price,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// (προαιρετικά) POST όταν κάνεις κράτηση, π.χ.
// router.post("/", async (req,res)=>{ ... create new Reservation ... })

module.exports = router;
