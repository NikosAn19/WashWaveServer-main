// models/Service.js
const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    // Αναφορά στο πλυντήριο που προσφέρει την υπηρεσία
    car_wash_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarWash", required: true },
    // Όνομα της υπηρεσίας
    name: { type: String, required: true },
    // Περιγραφή της υπηρεσίας
    description: { type: String, required: true },
    // Τιμή της υπηρεσίας (μπορείς να ορίσεις ως Number ή String, π.χ. '11.00 €*')
    price: { type: Number, required: true },
    // Διάρκεια της υπηρεσίας (σε λεπτά)
    duration: { type: Number, required: true },
    // Είδος οχήματος (π.χ. "Ι.Χ.", "SUV/JEEP", κλπ.)
    vehicle_type: { type: String, required: true },
    // Ημερομηνία δημιουργίας υπηρεσίας
    created_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property για το service_id που αντιστοιχεί στο _id
ServiceSchema.virtual("service_id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Service", ServiceSchema);
