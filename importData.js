const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// Σύνδεση με MongoDB (δημιουργείται αυτόματα η βάση αν δεν υπάρχει)
const mongoURI = "mongodb://localhost:27017/mydatabase";
mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("✅ Συνδέθηκε επιτυχώς στη MongoDB");

    // (Προαιρετικά) διαγράφουμε τις συλλογές για καθαρή εισαγωγή
    try {
      await mongoose.connection.db.dropCollection("carwashes");
      console.log("🗑️ Διαγράφηκε η συλλογή carwashes");
    } catch (err) {
      console.warn("⚠️ Η συλλογή carwashes δεν υπήρχε.");
    }
    try {
      await mongoose.connection.db.dropCollection("services");
      console.log("🗑️ Διαγράφηκε η συλλογή services");
    } catch (err) {
      console.warn("⚠️ Η συλλογή services δεν υπήρχε.");
    }

    // Εκτελούμε την εισαγωγή των εγγραφών
    await importCarWashes(); // Πλυντήρια
    await importServices();  // Υπηρεσίες

    mongoose.disconnect(); // Τερματισμός σύνδεσης
  })
  .catch((err) => console.error("❌ Σφάλμα σύνδεσης MongoDB:", err));

// Εισαγωγή μοντέλων
const CarWash = require("./models/CarWash");
const Service = require("./models/Service");

/**
 * Διαβάζει το αρχείο CarWash.csv και εισάγει τα δεδομένα στο MongoDB.
 */
function importCarWashes() {
  return new Promise((resolve, reject) => {
    const results = [];

    // Ανάγνωση CSV
    fs.createReadStream("CarWash.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log("📄 Επεξεργασία CarWash CSV ολοκληρώθηκε:", results.length, "γραμμές");

        try {
          for (const row of results) {
            const legacyId = parseInt(row.car_wash_id, 10);
            if (isNaN(legacyId)) {
              console.error(`❌ Μη έγκυρο car_wash_id: ${row.car_wash_id}`);
              continue;
            }

            // Δημιουργία νέου εγγράφου CarWash
            const carWash = new CarWash({
              legacy_id: legacyId,
              name: row.name,
              address: row.address,
              city: row.city,
              state: row.state,
              zip_code: row.zip_code,
              phone_number: row.phone_number,
              working_hours: row.working_hours,
              created_at: row.created_at ? new Date(row.created_at) : Date.now(),
            });

            await carWash.save(); // Αποθήκευση στη βάση
          }

          console.log("✅ Εισαγωγή CarWash εγγραφών ολοκληρώθηκε.");
          resolve();
        } catch (error) {
          console.error("❌ Σφάλμα κατά την εισαγωγή CarWash:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("❌ Σφάλμα ανάγνωσης CarWash CSV:", error);
        reject(error);
      });
  });
}

/**
 * Διαβάζει το αρχείο Service.csv και εισάγει τα δεδομένα,
 * συνδέοντάς τα με τα πλυντήρια βάσει του legacy_id.
 */
function importServices() {
  return new Promise((resolve, reject) => {
    const results = [];

    // Ανάγνωση CSV
    fs.createReadStream("Service.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log("📄 Επεξεργασία Service CSV ολοκληρώθηκε:", results.length, "γραμμές");

        try {
          for (const row of results) {
            const legacyId = parseInt(row.car_wash_id, 10);
            if (isNaN(legacyId)) {
              console.error(`❌ Μη έγκυρο car_wash_id: ${row.car_wash_id}`);
              continue;
            }

            // Βρίσκουμε το σχετικό CarWash με βάση το legacy_id
            const carWashDoc = await CarWash.findOne({ legacy_id: legacyId });
            if (!carWashDoc) {
              console.error(`⚠️ Δεν βρέθηκε CarWash για legacy_id: ${legacyId}`);
              continue;
            }

            // Δημιουργία νέας υπηρεσίας
            const newService = new Service({
              car_wash_id: carWashDoc._id,
              name: row.name,
              description: row.description,
              price: parseFloat(row.price),
              duration: parseInt(row.duration, 10),
              vehicle_type: row.vehicle_type,
              created_at: row.created_at ? new Date(row.created_at) : Date.now(),
            });

            await newService.save(); // Αποθήκευση υπηρεσίας
            console.log(`✅ Υπηρεσία αποθηκεύτηκε: ${newService.name}`);
          }

          console.log("✅ Όλες οι υπηρεσίες αποθηκεύτηκαν.");
          resolve();
        } catch (error) {
          console.error("❌ Σφάλμα κατά την εισαγωγή υπηρεσιών:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("❌ Σφάλμα ανάγνωσης Service CSV:", error);
        reject(error);
      });
  });
}
