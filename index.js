require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Route to handle signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email } = req.body;
    const newUser = await pool.query(
      'INSERT INTO user_information ("Email") VALUES ($1) RETURNING *',
      [email]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route to handle membership plan selection
app.put("/api/select-plan", async (req, res) => {
  try {
    const { email, membershipPlan } = req.body;
    const updateUser = await pool.query(
      'UPDATE user_information SET "Membership Plan" = $1 WHERE "Email" = $2 RETURNING *',
      [membershipPlan, email]
    );
    res.json(updateUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
