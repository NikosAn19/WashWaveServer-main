// models/CarWash.js
const mongoose = require("mongoose");

// Ορισμός του σχήματος (schema) για τα πλυντήρια αυτοκινήτων
const CarWashSchema = new mongoose.Schema(
  {
    // Αναγνωριστικό από το CSV αρχείο (χρησιμοποιείται για εισαγωγή δεδομένων)
    legacy_id: { type: Number, required: true, unique: true },

    // Όνομα του πλυντηρίου
    name: { type: String, required: true },

    // Διεύθυνση
    address: { type: String, required: true },

    // Πόλη
    city: { type: String, required: true },

    // Περιφέρεια/Νομός ή άλλο γεωγραφικό διαμέρισμα
    state: { type: String, required: true },

    // Ταχυδρομικός Κώδικας
    zip_code: { type: String, required: true },

    // Τηλέφωνο επικοινωνίας
    phone_number: { type: String, required: true },

    // Ωράριο λειτουργίας (προαιρετικό πεδίο)
    working_hours: { type: String },

    // Ημερομηνία δημιουργίας εγγραφής, προεπιλογή είναι η τρέχουσα ημερομηνία/ώρα
    created_at: { type: Date, default: Date.now },
  },
  {
    // Επιτρέπει τη χρήση virtual fields (εικονικών πεδίων) όταν γίνεται μετατροπή σε JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Εικονικό πεδίο που επιστρέφει το ObjectId της εγγραφής ως string
CarWashSchema.virtual("car_wash_id").get(function () {
  return this._id.toHexString();
});

// Εξαγωγή του μοντέλου ώστε να χρησιμοποιείται σε άλλα μέρη της εφαρμογής
module.exports = mongoose.model("CarWash", CarWashSchema);
