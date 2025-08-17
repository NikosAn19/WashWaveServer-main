const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// === ΕΓΓΡΑΦΗ ΧΡΗΣΤΗ ===
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      phone_number,
      first_name,
      last_name,
      address,
      city,
      state,
      zip_code,
    } = req.body;

    console.log("📥 Αίτημα εγγραφής για:", email);

    // Έλεγχος αν υπάρχει ήδη χρήστης με αυτό το email
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ Υπάρχει ήδη χρήστης με email:", email);
      return res.status(400).json({
        message:
          "Αυτό το email χρησιμοποιείται ήδη. Δοκίμασε κάποιο άλλο ή κάνε Σύνδεση αν έχεις ήδη λογαριασμό!",
      });
    }

    // Κρυπτογράφηση κωδικού πρόσβασης
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Δημιουργία τυχαίου κωδικού επιβεβαίωσης 6 ψηφίων
    const verification_code = crypto.randomInt(100000, 999999).toString();

    // Δημιουργία και αποθήκευση χρήστη
    user = new User({
      email,
      password_hash,
      phone_number,
      first_name,
      last_name,
      address,
      city,
      state,
      zip_code,
      is_verified: false,
      verification_code,
      created_at: new Date(),
    });

    await user.save();
    console.log("✅ Ο χρήστης δημιουργήθηκε με ID:", user._id);

    // Επιστροφή επιβεβαίωσης (χωρίς αποστολή email)
    return res.status(200).json({
      message:
        "Η εγγραφή ολοκληρώθηκε. Ο κωδικός επιβεβαίωσης είναι διαθέσιμος στο response για δοκιμαστικούς σκοπούς.",
      verification_code: verification_code,
    });
  } catch (error) {
    console.error("❗ Σφάλμα κατά την εγγραφή:", error);
    res.status(500).json({ message: "Σφάλμα διακομιστή." });
  }
});

// === ΕΠΙΒΕΒΑΙΩΣΗ EMAIL ===
router.post("/verify", async (req, res) => {
  try {
    const { email, verification_code } = req.body;
    console.log("📩 Επαλήθευση email για:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Δεν βρέθηκε χρήστης με email:", email);
      return res.status(400).json({
        message:
          "Δεν βρέθηκε λογαριασμός με αυτό το email. Δοκίμασε ξανά ή κάνε Εγγραφή.",
      });
    }

    if (user.verification_code !== verification_code) {
      console.log("❌ Λανθασμένος κωδικός επιβεβαίωσης για:", email);
      return res
        .status(400)
        .json({ message: "Ο κωδικός επαλήθευσης δεν είναι έγκυρος." });
    }

    user.is_verified = true;
    user.verification_code = undefined;
    await user.save();

    console.log("✅ Επιβεβαίωση email για χρήστη:", user.email);
    res.status(200).json({
      message: "Το e-mail έχει επιβεβαιωθεί με επιτυχία!",
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❗ Σφάλμα στην επαλήθευση:", error);
    res.status(500).json({ message: "Σφάλμα διακομιστή." });
  }
});

// === ΣΥΝΔΕΣΗ ΧΡΗΣΤΗ ===
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Απόπειρα σύνδεσης με email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Δεν βρέθηκε χρήστης για σύνδεση:", email);
      return res
        .status(400)
        .json({ message: "Λάθος στοιχεία. Παρακαλώ προσπαθήστε ξανά!" });
    }

    if (!user.is_verified) {
      console.log("⚠️ Το email δεν έχει επιβεβαιωθεί για:", email);
      return res.status(400).json({
        message: "Παρακαλώ επιβεβαιώστε το e-mail σας πριν την σύνδεση.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log("❌ Λανθασμένος κωδικός για:", email);
      return res
        .status(400)
        .json({ message: "Λάθος στοιχεία. Παρακαλώ προσπαθήστε ξανά!" });
    }

    console.log("✅ Επιτυχής σύνδεση για:", email);
    res.status(200).json({
      message: "Έχεις συνδεθεί επιτυχώς!",
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❗ Σφάλμα κατά τη σύνδεση:", error);
    res.status(500).json({ message: "Σφάλμα διακομιστή." });
  }
});

module.exports = router;
