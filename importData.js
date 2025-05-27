// importData.js
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// Σύνδεση με MongoDB (η βάση "mydatabase" δημιουργείται αυτόματα αν δεν υπάρχει)
const mongoURI = "mongodb://localhost:27017/mydatabase";
mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // (Προαιρετικά) Drop collections για καθαρή εκκίνηση
    try {
      await mongoose.connection.db.dropCollection("carwashes");
      console.log("Dropped collection: carwashes");
    } catch (err) {
      console.warn("No carwashes collection to drop.");
    }
    try {
      await mongoose.connection.db.dropCollection("services");
      console.log("Dropped collection: services");
    } catch (err) {
      console.warn("No services collection to drop.");
    }

    await importCarWashes(); // Εισαγωγή CarWash εγγράφων
    await importServices();  // Εισαγωγή Service εγγράφων

    mongoose.disconnect();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Εισαγωγή μοντέλων
const CarWash = require("./models/CarWash");
const Service = require("./models/Service");

/**
 * Εισαγωγή δεδομένων CarWash από το CSV.
 * Το CSV (CarWash.csv) έχει τις στήλες:
 * car_wash_id, name, address, city, state, zip_code, phone_number, working_hours, created_at
 * Θα χρησιμοποιήσουμε το car_wash_id ως legacy_id για το mapping.
 */
function importCarWashes() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream("CarWash.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log("CarWash CSV parsed. Number of rows:", results.length);
        try {
          for (const row of results) {
            // Μετατροπή της τιμής car_wash_id σε αριθμό για το legacy_id.
            const legacyId = parseInt(row.car_wash_id, 10);
            if (isNaN(legacyId)) {
              console.error(`Invalid legacy id value: ${row.car_wash_id}. Skipping row.`);
              continue;
            }
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
            await carWash.save();
          }
          console.log("CarWash data imported successfully.");
          resolve();
        } catch (error) {
          console.error("Error importing CarWash data:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error reading CarWash CSV:", error);
        reject(error);
      });
  });
}

/**
 * Εισαγωγή δεδομένων Services από το CSV.
 * Το CSV (Service.csv) έχει τις στήλες:
 * service_id, car_wash_id, name, description, price, duration, vehicle_type, created_at
 * Το πεδίο service_id είναι virtual και δεν χρησιμοποιείται.
 * Το car_wash_id στο CSV είναι ένας αριθμός (legacy id). Κάνουμε lookup στο CarWash collection βάσει του legacy_id.
 */
function importServices() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream("Service.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log("Services CSV parsed. Number of rows:", results.length);
        try {
          for (const row of results) {
            // Μετατροπή της τιμής car_wash_id σε Number (legacy id)
            const legacyId = parseInt(row.car_wash_id, 10);
            if (isNaN(legacyId)) {
              console.error(`Invalid car_wash_id value: ${row.car_wash_id}. Skipping row.`);
              continue;
            }
            // Αναζήτηση στο CarWash με βάση το legacy_id
            const carWashDoc = await CarWash.findOne({ legacy_id: legacyId });
            if (!carWashDoc) {
              console.error(`No CarWash found for legacy_id: ${row.car_wash_id}. Skipping this service.`);
              continue;
            }
            const newService = new Service({
              car_wash_id: carWashDoc._id, // Χρησιμοποιούμε το ObjectId του CarWash document
              name: row.name,
              description: row.description,
              price: parseFloat(row.price),
              duration: parseInt(row.duration, 10),
              vehicle_type: row.vehicle_type,
              created_at: row.created_at ? new Date(row.created_at) : Date.now(),
            });
            await newService.save();
            console.log(`Imported service: ${newService.name}`);
          }
          console.log("All services imported successfully.");
          resolve();
        } catch (error) {
          console.error("Error importing Services data:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error reading Services CSV:", error);
        reject(error);
      });
  })
}
