const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Ρύθμιση NodeMailer (χρησιμοποιώντας π.χ. Ethereal ή άλλο provider)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'willy.raynor@ethereal.email',
        pass: 'mYdptxxjcuceXFbESm'
    },
    tls: {
      // Σημαντικό: Απενεργοποιεί την επαλήθευση πιστοποιητικού για τις δοκιμές (δεν χρησιμοποιείται σε παραγωγή)
      rejectUnauthorized: false
    }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, phone_number, first_name, last_name, address, city, state, zip_code } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Δημιουργία κωδικού επαλήθευσης (π.χ. 6 ψηφία)
    const verification_code = crypto.randomInt(100000, 999999).toString();

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

    // Αποστολή email επαλήθευσης
    const mailOptions = {
      from: '"WashWave" <no-reply@washwave.com>',
      to: email,
      subject: "Email Verification",
      text: `Your verification code is: ${verification_code}. Please enter it in the app to verify your email.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending verification email." });
      }
      console.log("Verification email sent:", info.response);
      const responsePayload = { message: "User registered. Verification code sent to email.", verification_code:verification_code };
      // if (process.env.NODE_ENV !== "production") {
      //   responsePayload.verification_code = verification_code;
      // }
      return res.status(200).json(responsePayload);
    });
    
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Email verification endpoint (μέσα στο auth.js)
router.post("/verify", async (req, res) => {
  try {
    const { email, verification_code } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.verification_code !== verification_code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }
    user.is_verified = true;
    user.verification_code = undefined; // Προαιρετικά: καθαρίζουμε τον κωδικό
    await user.save();
    res.status(200).json({ message: "Email verified successfully.",user: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    } });
  } catch (error) {
    console.error("Error in /verify:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    if (!user.is_verified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    res.status(200).json({ message: "Login successful." ,
      user: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }});
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
