require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to handle email submission
app.post("/api/agency_information", async (req, res) => {
  try {
    const { email, membershipPlan } = req.body;
    if (email) {
      const newEmailEntry = await pool.query(
        'INSERT INTO agency_information ("Email") VALUES ($1) RETURNING *',
        [email]
      );
      res.json(newEmailEntry.rows[0]);
    } else if (membershipPlan) {
      const updatePlan = await pool.query(
        'UPDATE agency_information SET "Membership Plan" = $1 WHERE "Email" IS NOT NULL RETURNING *',
        [membershipPlan]
      );
      res.json(updatePlan.rows[0]);
    } else {
      res.status(400).send("Invalid request");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
