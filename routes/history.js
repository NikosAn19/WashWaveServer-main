const express = require("express");
const router = express.Router();

// Εισαγωγή των μοντέλων Mongoose που απαιτούνται
const Reservation = require("../models/Reservation");
const CarWash = require("../models/CarWash");
const Service = require("../models/Service");

/**
 * POST /api/history
 * Δημιουργεί νέα κράτηση και την αποθηκεύει στη βάση δεδομένων.
 * Αναμένεται body: { user_email, vehicle_type, service_id, car_wash_id, reserved_at }
 */
router.post("/", async (req, res) => {
  try {
    // Ανάκτηση δεδομένων από το body του αιτήματος
    const {
      user_email,
      vehicle_type,
      service_id,
      car_wash_id,
      reserved_at
    } = req.body;

    console.log("➡️ Λήφθηκε αίτημα κράτησης από:", user_email);

    // Έλεγχος για απαιτούμενα πεδία
    if (!user_email || !vehicle_type || !service_id || !car_wash_id || !reserved_at) {
      console.log("❌ Λείπουν πεδία:", req.body);
      return res.status(400).json({ message: "Λείπουν απαιτούμενα πεδία." });
    }

    // Δημιουργία νέου εγγράφου κράτησης
    const reservation = new Reservation({
      user_email,
      vehicle_type,
      service_id,
      car_wash_id,
      reserved_at: new Date(reserved_at), // μετατροπή σε τύπο Date
    });

    // Αποθήκευση στο MongoDB
    await reservation.save();

    console.log(`✅ Κράτηση αποθηκεύτηκε: ${reservation._id} για ${user_email}`);
    res.status(201).json({
      message: "Η κράτηση αποθηκεύτηκε με επιτυχία.",
      reservation
    });

  } catch (err) {
    // Καταγραφή και επιστροφή σφάλματος
    console.error("❗ Σφάλμα στο POST /api/history:", err);
    res.status(500).json({ message: "Σφάλμα διακομιστή κατά την αποθήκευση." });
  }
});

/**
 * GET /api/history?email=...
 * Επιστρέφει το ιστορικό κρατήσεων για έναν συγκεκριμένο χρήστη.
 * Περιλαμβάνει populate() ώστε να εμφανίζονται ονόματα πλυντηρίου και υπηρεσίας.
 */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    console.log(`🔍 Ανάκτηση κρατήσεων για χρήστη: ${email}`);

    // Αν δεν έχει σταλεί email, επιστρέφουμε σφάλμα
    if (!email) {
      console.log("❌ Απαιτείται email ως παράμετρος.");
      return res.status(400).json({ message: "Απαιτείται το email ως παράμετρος." });
    }

    // Προκαταρκτική αναζήτηση κρατήσεων για logging
    const reservations = await Reservation.find({ user_email: email })
      .sort({ reserved_at: -1 }) // Ταξινόμηση κατά ημερομηνία κράτησης
      .lean();

    console.log(`📦 Βρέθηκαν ${reservations.length} κρατήσεις για ${email}`);

    // Debug: καταγραφή ύπαρξης συσχετιζόμενων οντοτήτων
    for (const reservation of reservations) {
      const carWash = await CarWash.findById(reservation.car_wash_id);
      const service = await Service.findById(reservation.service_id);

      console.log(`🗂 Κράτηση ${reservation._id}:`);
      console.log(`   🧼 Πλυντήριο (${reservation.car_wash_id}): ${carWash ? "✅ Βρέθηκε" : "❌ Δεν βρέθηκε"}`);
      console.log(`   🛠 Υπηρεσία (${reservation.service_id}): ${service ? "✅ Βρέθηκε" : "❌ Δεν βρέθηκε"}`);
    }

    // Εμπλουτισμένη αναζήτηση (populate) για να επιστρέψουμε ονόματα και τιμές
    const populatedReservations = await Reservation.find({ user_email: email })
      .sort({ reserved_at: -1 })
      .populate("car_wash_id", "name")
      .populate("service_id", "name price")
      .lean();

    // Διαμόρφωση του αποτελέσματος
    const result = populatedReservations.map((r) => ({
      reservation_id: r._id,
      reserved_at: r.reserved_at,
      vehicle_type: r.vehicle_type,
      car_wash_name: r.car_wash_id?.name || "Άγνωστο Πλυντήριο",
      service: {
        name: r.service_id?.name || "Άγνωστη Υπηρεσία",
        price: r.service_id?.price || 0,
      },
    }));

    console.log(`📤 Επιστρέφονται ${result.length} κρατήσεις στο frontend.`);
    res.json(result);
  } catch (err) {
    console.error("❗ Σφάλμα κατά την ανάκτηση ιστορικού:", err);
    res.status(500).json({
      message: "Σφάλμα διακομιστή κατά την ανάκτηση κρατήσεων.",
      error: err.message,
    });
  }
});

module.exports = router;
