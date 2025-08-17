const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

/**
 * GET /api/services/by-vehicle/:vehicleType
 * Επιστρέφει μοναδικές υπηρεσίες (distinct by name) για έναν συγκεκριμένο τύπο οχήματος.
 * Π.χ. GET /api/services/by-vehicle/Αυτοκίνητο
 */
router.get("/by-vehicle/:vehicleType", async (req, res) => {
  try {
    const { vehicleType } = req.params;
    console.log(`🔍 Αναζήτηση υπηρεσιών για τύπο οχήματος: ${vehicleType}`);

    const services = await Service.aggregate([
      // Φιλτράρουμε μόνο τις υπηρεσίες που αντιστοιχούν στον συγκεκριμένο τύπο οχήματος
      { $match: { vehicle_type: vehicleType } },

      // Ταξινόμηση κατά αύξουσα τιμή
      { $sort: { price: 1 } },

      // Ομαδοποίηση κατά όνομα υπηρεσίας, ώστε να επιστραφεί μία εγγραφή ανά όνομα
      {
        $group: {
          _id: "$name",
          service: { $first: "$$ROOT" }, // Επιλέγεται το πρώτο ως αντιπροσωπευτικό (πιο φθηνό λόγω ταξινόμησης)
          count: { $sum: 1 }, // Πόσες φορές εμφανίζεται η υπηρεσία (δηλ. σε πόσα πλυντήρια)
        },
      },

      // Επαναδομούμε το αντικείμενο ώστε να περιλαμβάνει το πλήθος τοποθεσιών
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$service", { available_locations: "$count" }],
          },
        },
      },

      // Τελική ταξινόμηση αλφαβητικά βάσει ονόματος
      { $sort: { name: 1 } },
    ]);

    console.log(`✅ Βρέθηκαν ${services.length} μοναδικές υπηρεσίες για το όχημα: ${vehicleType}`);
    res.json(services);
  } catch (err) {
    console.error("❗ Σφάλμα κατά την αναζήτηση υπηρεσιών ανά τύπο οχήματος:", err);
    res.status(500).json({
      message: "Σφάλμα διακομιστή κατά την αναζήτηση υπηρεσιών.",
      error: err.message,
    });
  }
});

/**
 * GET /api/services/distinct
 * Επιστρέφει μία (πιο φθηνή) υπηρεσία ανά όνομα, μαζί με όλους τους τύπους οχημάτων
 * στους οποίους προσφέρεται, και τον αριθμό των τοποθεσιών.
 */
router.get("/distinct", async (req, res) => {
  try {
    console.log("🔄 Ανάκτηση μοναδικών υπηρεσιών με grouping...");

    const distinctServices = await Service.aggregate([
      // Ταξινόμηση όλων των υπηρεσιών κατά τιμή
      { $sort: { price: 1 } },

      // Ομαδοποίηση κατά όνομα υπηρεσίας (παίρνουμε το πρώτο ως πιο φθηνό)
      {
        $group: {
          _id: "$name",
          service: { $first: "$$ROOT" },
          vehicle_types: { $addToSet: "$vehicle_type" },
          available_locations: { $sum: 1 },
        },
      },

      // Αναδιάρθρωση ώστε να συγχωνευτούν όλα τα στοιχεία σε ένα τελικό αντικείμενο
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$service",
              {
                vehicle_types: "$vehicle_types",
                available_locations: "$available_locations",
              },
            ],
          },
        },
      },

      // Τελική ταξινόμηση αλφαβητικά κατά όνομα
      { $sort: { name: 1 } },
    ]);

    console.log(`✅ Βρέθηκαν ${distinctServices.length} μοναδικές υπηρεσίες συνολικά.`);
    res.json(distinctServices);
  } catch (err) {
    console.error("❗ Σφάλμα κατά την αναζήτηση μοναδικών υπηρεσιών:", err);
    res.status(500).json({
      message: "Σφάλμα διακομιστή κατά την ανάκτηση υπηρεσιών.",
      error: err.message,
    });
  }
});

/**
 * GET /api/services/vehicle-types
 * Επιστρέφει όλους τους διαθέσιμους τύπους οχημάτων (π.χ. Αυτοκίνητο, SUV, Μηχανή).
 */
router.get("/vehicle-types", async (req, res) => {
  try {
    console.log("📦 Ανάκτηση διαθέσιμων τύπων οχημάτων...");

    // Χρήση της distinct() για ανάκτηση μοναδικών τιμών από το πεδίο vehicle_type
    const types = await Service.distinct("vehicle_type");

    console.log(`✅ Βρέθηκαν ${types.length} τύποι οχημάτων: ${types.join(", ")}`);
    res.json(types.sort()); // Προαιρετική ταξινόμηση
  } catch (err) {
    console.error("❗ Σφάλμα κατά την ανάκτηση τύπων οχημάτων:", err);
    res.status(500).json({
      message: "Σφάλμα διακομιστή κατά την ανάκτηση τύπων οχημάτων.",
    });
  }
});

module.exports = router;
