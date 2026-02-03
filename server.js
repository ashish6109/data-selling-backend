const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== DB CONNECTION ================== */
const MONGO_URL = process.env.MONGODB_URL;

if (!MONGO_URL) {
  console.error("❌ MongoDB URL not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

/* ================== ROUTES ================== */

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running & DB connected");
});

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      isMember: false,
      earnings: 0
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id,
      isMember: user.isMember
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Activate Membership (after payment)
app.post("/activate-membership", async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      isMember: true
    });

    res.json({ message: "Membership activated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Activation failed" });
  }
});

// Dashboard data
app.get("/dashboard/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.json({
      earnings: user.earnings,
      isMember: user.isMember
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

/* ================== SERVER START ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
