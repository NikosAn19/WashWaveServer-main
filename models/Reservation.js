// models/Reservation.js
const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true }, // το email του χρήστη
    car_wash_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarWash",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    vehicle_type: { type: String, required: true },
    reserved_at: { type: Date, required: true }, // ημερομηνία & ώρα κράτησης
  },
  {
    timestamps: true,
  }
);

// virtuals για ευκολία
ReservationSchema.virtual("reservation_id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Reservation", ReservationSchema);
