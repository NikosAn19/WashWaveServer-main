// models/Reservation.js
const mongoose = require("mongoose");

// Ορισμός του σχήματος για τις κρατήσεις
const ReservationSchema = new mongoose.Schema(
  {
    // Email του χρήστη που κάνει την κράτηση
    user_email: { type: String, required: true },

    // Αναφορά στο πλυντήριο αυτοκινήτων (σχέση με CarWash μέσω ObjectId)
    car_wash_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarWash", // Όνομα του μοντέλου στο οποίο γίνεται αναφορά
      required: true,
    },

    // Αναφορά στην υπηρεσία που επιλέχθηκε (σχέση με Service)
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Τύπος οχήματος (π.χ. sedan, SUV, μηχανή)
    vehicle_type: { type: String, required: true },

    // Ημερομηνία και ώρα κράτησης (όταν προγραμματίστηκε να γίνει το ραντεβού)
    reserved_at: { type: Date, required: true },
  },
  {
    // Αυτόματη προσθήκη των createdAt και updatedAt πεδίων
    timestamps: true,
  }
);

// Εικονικό πεδίο για να επιστρέφεται το ObjectId της κράτησης 
ReservationSchema.virtual("reservation_id").get(function () {
  return this._id.toHexString();
});

// Εξαγωγή του μοντέλου για χρήση στην υπόλοιπη εφαρμογή
module.exports = mongoose.model("Reservation", ReservationSchema);
