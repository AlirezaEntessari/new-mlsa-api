require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/agency_information", async (req, res) => {
  const {
    email,
    membershipPlan,
    staffingAgencyName,
    staffingAgencyEIN,
    staffingAgencyWebsite,
    fullNameAdmin,
    password,
  } = req.body;

  try {
    const query = `
      INSERT INTO agency_information (
        "Email",
        "Membership Plan",
        "Staffing Agency Name",
        "Staffing Agency EIN",
        "Staffing Agency Website",
        "Full Name (Admin)",
        "Password"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    await pool.query(query, [
      email,
      membershipPlan,
      staffingAgencyName,
      staffingAgencyEIN,
      staffingAgencyWebsite,
      fullNameAdmin,
      password,
    ]);

    res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while saving data" });
  }
});

app.post('/api/payment-details', async (req, res) => {
  const {
    firstName,
    lastName,
    cardNumber,
    expires,
    cvv,
    addressLine1,
    addressLine2,
    city,
    state,
    countryRegion,
    zipCode,
  } = req.body;

  const query = `
    INSERT INTO payment_details (
      "First name", "Last name", "Card number", "Expires", "CVV", 
      "Address Line 1", "Address Line 2", "City", "State", 
      "Country/region", "Zip code"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  const values = [
    firstName, lastName, cardNumber, expires, cvv, 
    addressLine1, addressLine2, city, state, 
    countryRegion, zipCode
  ];

  try {
    await pool.query(query, values);
    res.status(200).json({ message: 'Payment details saved successfully' });
  } catch (error) {
    console.error('Error saving payment details:', error);
    res.status(500).json({ error: 'Failed to save payment details' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
