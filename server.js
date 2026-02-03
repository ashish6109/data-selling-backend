const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("YOUR_MONGODB_URL")
.then(() => console.log("DB Connected"));

app.post("/signup", async (req, res) => {
  res.json({ msg: "Signup API working" });
});

app.post("/login", async (req, res) => {
  res.json({ msg: "Login API working" });
});

app.listen(5000, () => {
  console.log("Server running");
});
