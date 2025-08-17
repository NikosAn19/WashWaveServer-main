const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * GET /api/user/profile?email=...
 * Ανάκτηση προφίλ χρήστη με βάση το email.
 */
router.get("/profile", async (req, res) => {
  try {
    const email = req.query.email;
    console.log(`📥 Λήφθηκε αίτημα για το προφίλ του χρήστη: ${email}`);

    // Έλεγχος αν το email παρέχεται στο query string
    if (!email) {
      console.log("❌ Το email δεν παρέχεται στο query.");
      return res.status(400).json({ message: "Απαιτείται το email." });
    }

    // Αναζήτηση του χρήστη με βάση το email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ Ο χρήστης δεν βρέθηκε για email: ${email}`);
      return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε." });
    }

    console.log(`✅ Ο χρήστης βρέθηκε: ${user.first_name} ${user.last_name}`);

    // Επιλογή πεδίων που θα επιστραφούν στο frontend (π.χ. χωρίς password_hash)
    const {
      first_name,
      last_name,
      email: userEmail,
      phone_number,
      address,
      city,
      state,
      zip_code,
    } = user;

    // Επιστροφή δεδομένων χρήστη
    return res.status(200).json({
      first_name,
      last_name,
      email: userEmail,
      phone_number,
      address,
      city,
      state,
      zip_code,
    });
  } catch (error) {
    console.error("❗ Σφάλμα κατά την ανάκτηση προφίλ χρήστη:", error);
    return res.status(500).json({ message: "Σφάλμα διακομιστή." });
  }
});

/**
 * PUT /api/user/profile
 * Ενημερώνει το προφίλ χρήστη με βάση το email.
 * Περιμένει στο body τα ενημερωμένα στοιχεία.
 */
router.put("/profile", async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      phone_number,
      address,
      city,
      state,
      zip_code,
    } = req.body;

    console.log(`📤 Λήφθηκε αίτημα ενημέρωσης προφίλ για email: ${email}`);

    // Έλεγχος αν παρέχεται το email στο request body
    if (!email) {
      console.log("❌ Το email δεν παρέχεται στο body.");
      return res.status(400).json({ message: "Απαιτείται το email." });
    }

    // Ενημέρωση του χρήστη και επιστροφή του ενημερωμένου εγγράφου
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { first_name, last_name, phone_number, address, city, state, zip_code },
      { new: true } // Επιστρέφει το ενημερωμένο αντικείμενο
    );

    if (!updatedUser) {
      console.log(`❌ Δεν βρέθηκε χρήστης με email: ${email}`);
      return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε." });
    }

    console.log(`✅ Το προφίλ του χρήστη ενημερώθηκε: ${updatedUser.first_name} ${updatedUser.last_name}`);

    // Επιστροφή των νέων δεδομένων του χρήστη
    return res.status(200).json({
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone_number: updatedUser.phone_number,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zip_code: updatedUser.zip_code,
    });
  } catch (error) {
    console.error("❗ Σφάλμα κατά την ενημέρωση του προφίλ:", error);
    return res.status(500).json({ message: "Σφάλμα διακομιστή." });
  }
});

module.exports = router;
