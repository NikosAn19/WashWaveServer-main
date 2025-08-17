const express = require("express");
const router = express.Router();

// Φόρτωση των μοντέλων
const Service = require("../models/Service");
const CarWash = require("../models/CarWash");
const Reservation = require("../models/Reservation"); // Χρησιμοποιείται για να ελέγξουμε τις κρατήσεις

/**
 * GET /api/carwashes?service_name=...&vehicle_type=...
 * Επιστρέφει όλα τα πλυντήρια που προσφέρουν μια συγκεκριμένη υπηρεσία
 * για συγκεκριμένο τύπο οχήματος.
 */
router.get("/", async (req, res) => {
  try {
    const { service_name, vehicle_type } = req.query;
    console.log("🔍 Λήφθηκε αίτημα GET /api/carwashes με:", { service_name, vehicle_type });

    if (!service_name || !vehicle_type) {
      console.log("❌ Απουσιάζουν τα απαιτούμενα πεδία.");
      return res.status(400).json({
        message: "Απαιτούνται τα πεδία service_name και vehicle_type.",
      });
    }

    const services = await Service.find({
      name: service_name,
      vehicle_type: vehicle_type,
    });
    console.log(`✅ Βρέθηκαν ${services.length} υπηρεσίες με τα ζητούμενα κριτήρια.`);

    const carWashIds = services.map((service) => service.car_wash_id);
    console.log("📦 Συλλεχθέντα car_wash_ids:", carWashIds);

    const carwashes = await CarWash.find({
      _id: { $in: carWashIds },
    });
    console.log(`✅ Εντοπίστηκαν ${carwashes.length} πλυντήρια.`);

    res.json(carwashes);
  } catch (err) {
    console.error("❗ Σφάλμα στο GET /api/carwashes:", err);
    res.status(500).json({ message: "Σφάλμα διακομιστή.", error: err.message });
  }
});

/**
 * GET /api/carwashes/:id/available-times?date=YYYY-MM-DD
 * Επιστρέφει διαθέσιμες ώρες για συγκεκριμένο πλυντήριο και ημερομηνία,
 * αποκλείοντας ώρες που έχουν ήδη κρατηθεί.
 */
router.get("/:id/available-times", async (req, res) => {
  try {
    const carwashId = req.params.id;
    const date = req.query.date; // π.χ. "2025-06-25"

    console.log(`🔄 Ανάκτηση διαθεσιμότητας για πλυντήριο: ${carwashId}, ημερομηνία: ${date}`);

    if (!date) {
      return res.status(400).json({ message: "Η ημερομηνία (π.χ. date=2025-06-25) είναι απαραίτητη." });
    }

    const carwash = await CarWash.findById(carwashId);
    if (!carwash) {
      console.log("❌ Δεν βρέθηκε πλυντήριο με ID:", carwashId);
      return res.status(404).json({ message: "Το πλυντήριο δεν βρέθηκε." });
    }

    console.log(`🕒 Ωράριο λειτουργίας: ${carwash.working_hours}`);
    const [start, end] = carwash.working_hours.split(" - ");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    // Δημιουργία όλων των διαθέσιμων 30λεπτων slots
    const allTimes = [];
    let h = startH;
    let m = startM;

    while (h < endH || (h === endH && m < endM)) {
      allTimes.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }

    // Εύρεση κρατήσεων για τη συγκεκριμένη ημερομηνία
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const reservations = await Reservation.find({
      car_wash_id: carwashId,
      reserved_at: { $gte: startOfDay, $lte: endOfDay },
    });

    const reservedTimes = reservations.map((r) => {
      const timeStr = new Date(r.reserved_at).toTimeString().slice(0, 5); // HH:MM
      return timeStr;
    });

    console.log(`⛔ Ήδη κρατημένες ώρες: ${reservedTimes.join(", ")}`);

    // Φιλτράρισμα κρατημένων ωρών
    const availableTimes = allTimes.filter(t => !reservedTimes.includes(t));

    console.log(`✅ Διαθέσιμες ώρες: ${availableTimes.join(", ")}`);
    res.json({ available_times: availableTimes });
  } catch (err) {
    console.error("❗ Σφάλμα στο /available-times:", err);
    res.status(500).json({ message: "Σφάλμα διακομιστή.", error: err.message });
  }
});

module.exports = router;
