// models/CarWash.js
const mongoose = require("mongoose");

const CarWashSchema = new mongoose.Schema(
  {
    legacy_id: { type: Number, required: true, unique: true }, // Νέο πεδίο για το numeric id από το CSV
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    phone_number: { type: String, required: true },
    working_hours: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual για το car_wash_id (ObjectId) για ευκολία, αν χρειάζεται
CarWashSchema.virtual("car_wash_id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("CarWash", CarWashSchema);
