// server.js
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware για να διαβάζουμε JSON στο body των αιτήσεων
app.use(express.json());

// Σύνδεση με MongoDB
const mongoURI = "mongodb://localhost:27017/mydatabase"; // Αν χρησιμοποιείς το MongoDB τοπικά
// Για MongoDB Atlas, θα έχεις μια σύνδεση σε URL μορφή.
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Δείγμα route
app.get("/", (req, res) => {
  res.send("Hello from the Node.js server!");
});

// Ενσωμάτωση του auth router
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
// Ενσωμάτωση των user endpoints
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);

// Services router
const servicesRouter = require("./routes/services");
app.use("/api/services", servicesRouter);

// History router
const historyRouter = require("./routes/history");
app.use("/api/history", historyRouter);

// Carwashes Router
const carwashesRouter = require("./routes/carwashes");
app.use("/api/carwashes", carwashesRouter);

// Ορισμός του port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
