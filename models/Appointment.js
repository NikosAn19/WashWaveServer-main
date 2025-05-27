// models/Appointment.js
const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    // Αναφορά στο χρήστη που έκανε την κράτηση (User)
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Τύπος οχήματος (π.χ. "Ι.Χ.", "VAN/ΦΟΡΤΗΓΟ", "SUV/JEEP", "MOTO")
    vehicle_type: { type: String, required: true },
    // Τύπος υπηρεσίας (π.χ. "Πλύσιμο χέρι - Μέσα - έξω")
    service_type: { type: String, required: true },
    // Αναφορά στο πλυντήριο (CarWash)
    car_wash_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarWash", required: true },
    // Ημερομηνία και ώρα ραντεβού
    appointment_date: { type: Date, required: true },
    // Ημερομηνία δημιουργίας του ραντεβού
    created_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property για το appointment_id που αντιστοιχεί στο _id
AppointmentSchema.virtual("appointment_id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
