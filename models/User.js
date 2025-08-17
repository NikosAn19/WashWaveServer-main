// models/User.js
const mongoose = require("mongoose");

// Ορισμός του σχήματος χρήστη (User)
const UserSchema = new mongoose.Schema(
  {
    // Το μοναδικό email του χρήστη (χρησιμοποιείται ως όνομα χρήστη / login)
    email: { type: String, required: true, unique: true },

    // Ο κρυπτογραφημένος κωδικός πρόσβασης (hash)
    password_hash: { type: String, required: true },

    // Αριθμός τηλεφώνου του χρήστη (υποχρεωτικό πεδίο)
    phone_number: { type: String, required: true },

    // Προαιρετικό μικρό όνομα του χρήστη
    first_name: { type: String, required: false },

    // Προαιρετικό επώνυμο του χρήστη
    last_name: { type: String, required: false },

    // Διεύθυνση κατοικίας (προαιρετικό)
    address: { type: String },

    // Πόλη κατοικίας (προαιρετικό)
    city: { type: String },

    // Περιφέρεια / Νομός (προαιρετικό)
    state: { type: String },

    // Ταχυδρομικός κώδικας (προαιρετικό)
    zip_code: { type: String },

    // Επισήμανση αν ο χρήστης έχει επαληθευτεί (π.χ. μέσω email/SMS)
    is_verified: { type: Boolean, default: false },

    // Κωδικός επαλήθευσης για ενεργοποίηση λογαριασμού (π.χ. για email)
    verification_code: { type: String },

    // Ημερομηνία δημιουργίας λογαριασμού
    created_at: { type: Date, default: Date.now },
  },
  {
    // Ενεργοποίηση virtuals όταν μετατρέπεται σε JSON ή αντικείμενο
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property για εύκολη πρόσβαση στο _id ως user_id
UserSchema.virtual("user_id").get(function () {
  return this._id.toHexString();
});

// Εξαγωγή του μοντέλου για χρήση στο υπόλοιπο backend
module.exports = mongoose.model("User", UserSchema);
