// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Endpoint για ανάκτηση (GET) των στοιχείων του χρήστη.
// Αναμένουμε το email ως query parameter, π.χ. /api/user/profile?email=nikos@example.com
router.get("/profile", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Επιστρέφουμε τα απαραίτητα πεδία (μη συμπεριλαμβανομένου του password_hash και verification_code)
    const { first_name, last_name, email: userEmail, phone_number, address, city, state, zip_code } = user;
    return res.status(200).json({ first_name, last_name, email: userEmail, phone_number, address, city, state, zip_code });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Endpoint για ενημέρωση (PUT) των στοιχείων του χρήστη
router.put("/profile", async (req, res) => {
  try {
    const { email, first_name, last_name, phone_number, address, city, state, zip_code } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { first_name, last_name, phone_number, address, city, state, zip_code },
      { new: true } // Επιστρέφει το ενημερωμένο document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Επιστρέφουμε τα ενημερωμένα στοιχεία του χρήστη
    const { first_name: fn, last_name: ln, email: userEmail, phone_number: pn, address: addr, city: c, state: s, zip_code: zc } = updatedUser;
    return res.status(200).json({ first_name: fn, last_name: ln, email: userEmail, phone_number: pn, address: addr, city: c, state: s, zip_code: zc });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
