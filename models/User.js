// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    phone_number: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    is_verified: { type: Boolean, default: false },
    verification_code: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property για το user_id που αντιστοιχεί στο _id
UserSchema.virtual("user_id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("User", UserSchema);
