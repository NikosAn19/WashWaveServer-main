// Βασικές βιβλιοθήκες
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware για JSON requests
app.use(express.json());

// Σύνδεση με MongoDB (τοπικά)
mongoose.connect("mongodb://localhost:27017/mydatabase")
  .then(() => console.log("✅ Συνδέθηκε με MongoDB"))
  .catch((err) => console.error("❌ Σφάλμα σύνδεσης:", err));

// Βασικό route για έλεγχο λειτουργίας
app.get("/", (req, res) => {
  res.send("Node.js server is running");
});

// Ενσωμάτωση routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/services", require("./routes/services"));
app.use("/api/history", require("./routes/history"));
app.use("/api/carwashes", require("./routes/carwashes"));

// Εκκίνηση server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
