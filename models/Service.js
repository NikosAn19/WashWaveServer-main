// models/Service.js
const mongoose = require("mongoose");

// Ορισμός του σχήματος για τις υπηρεσίες που προσφέρονται από τα πλυντήρια
const ServiceSchema = new mongoose.Schema(
  {
    // Αναφορά στο πλυντήριο αυτοκινήτων που παρέχει αυτή την υπηρεσία
    car_wash_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarWash", // Σύνδεση με το μοντέλο CarWash
      required: true,
    },

    // Όνομα της υπηρεσίας (π.χ. "Εξωτερικό Πλύσιμο")
    name: { type: String, required: true },

    // Περιγραφή της υπηρεσίας (τι περιλαμβάνει, ειδικές λεπτομέρειες κ.λπ.)
    description: { type: String, required: true },

    // Τιμή της υπηρεσίας σε ευρώ (ως αριθμός)
    price: { type: Number, required: true },

    // Διάρκεια εκτέλεσης της υπηρεσίας (σε λεπτά)
    duration: { type: Number, required: true },

    // Κατηγορία οχήματος για το οποίο ισχύει η υπηρεσία (π.χ. "SUV", "Ι.Χ.")
    vehicle_type: { type: String, required: true },

    // Ημερομηνία δημιουργίας εγγραφής (προεπιλεγμένη τιμή: τώρα)
    created_at: { type: Date, default: Date.now },
  },
  {
    // Ενεργοποίηση των virtuals όταν γίνεται μετατροπή σε JSON ή αντικείμενο
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Εικονικό πεδίο για επιστροφή του _id ως service_id 
ServiceSchema.virtual("service_id").get(function () {
  return this._id.toHexString();
});

// Εξαγωγή του μοντέλου Service για χρήση στην υπόλοιπη εφαρμογή
module.exports = mongoose.model("Service", ServiceSchema);
