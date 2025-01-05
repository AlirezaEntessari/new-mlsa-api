require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

app.post("/api/agency_information", async (req, res) => {
  const {
    email,
    membershipPlan,
    staffingAgencyName,
    staffingAgencyEIN,
    staffingAgencyWebsite,
    industryField,
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
        "Industry Field",
        "Full Name (Admin)",
        "Password"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    await pool.query(query, [
      email,
      membershipPlan,
      staffingAgencyName,
      staffingAgencyEIN,
      staffingAgencyWebsite,
      industryField,
      fullNameAdmin,
      password,
    ]);

    res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while saving data" });
  }
});

// app.post('/api/payment-details', async (req, res) => {
//   const {
//     billingDuration,
//     firstName,
//     lastName,
//     cardNumber,
//     expires,
//     cvv,
//     addressLine1,
//     addressLine2,
//     city,
//     state,
//     countryRegion,
//     zipCode,
//   } = req.body;

//   const query = `
//     INSERT INTO payment_details (
//       "Billing Duration", "First name", "Last name", "Card number", "Expires", "CVV", 
//       "Address Line 1", "Address Line 2", "City", "State", 
//       "Country/region", "Zip code"
//     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
//   `;

//   const values = [
//     billingDuration, firstName, lastName, cardNumber, expires, cvv, 
//     addressLine1, addressLine2, city, state, 
//     countryRegion, zipCode
//   ];

//   try {
//     await pool.query(query, values);
//     res.status(200).json({ message: 'Payment details saved successfully' });
//   } catch (error) {
//     console.error('Error saving payment details:', error);
//     res.status(500).json({ error: 'Failed to save payment details' });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const query = `
//       SELECT * FROM agency_information WHERE "Email" = $1 AND "Password" = $2;
//     `;
//     const result = await pool.query(query, [email, password]);

//     if (result.rows.length > 0) {
//       res.status(200).json({ message: "Login successful" });
//     } else {
//       res.status(401).json({ error: "Email and password do not match" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "An error occurred during login" });
//   }
// });

app.post('/api/payment-details', async (req, res) => {
  const {
    billingDuration,
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
      "Billing Duration", "First name", "Last name", "Card number", "Expires", "CVV", 
      "Address Line 1", "Address Line 2", "City", "State", 
      "Country/region", "Zip code"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  const values = [
    billingDuration, firstName, lastName, cardNumber, expires, cvv, 
    addressLine1, addressLine2, city, state, 
    countryRegion, zipCode
  ];

  try {
    await pool.query(query, values);

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MLSA Membership',
            },
            unit_amount: billingDuration === 'Yearly' ? 249900 : 24900,  // $2499.00 for yearly or $249.00 for monthly
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

app.post("/api/save-draft", async (req, res) => {
  const { firstName, lastName, email, phone, biography } = req.body;

  if (!firstName || !lastName || !email || !phone || !biography) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = `
    INSERT INTO account_settings_administrator_profile ("First Name", "Last Name", "Email", "Phone", "Biography")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      firstName,
      lastName,
      email,
      phone,
      biography,
    ]);
    res.status(201).json({
      message: "Draft saved successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Error saving draft." });
  }
});

app.post("/api/save-agency-draft", async (req, res) => {
  const {
    nameOfAgency,
    agencyPhone,
    agencyWebsite,
    facebookLink,
    instagramLink,
    youtubeLink,
    aboutYourAgency,
  } = req.body;

  if (
    !nameOfAgency ||
    !agencyPhone ||
    !agencyWebsite ||
    !facebookLink ||
    !instagramLink ||
    !youtubeLink ||
    !aboutYourAgency
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = `
    INSERT INTO account_settings_administrator_agency (
      "Name of Agency",
      "Agency Phone",
      "Agency Website",
      "Facebook Link",
      "Instagram Link",
      "YouTube Link",
      "About Your Agency"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      nameOfAgency,
      agencyPhone,
      agencyWebsite,
      facebookLink,
      instagramLink,
      youtubeLink,
      aboutYourAgency,
    ]);
    res.status(201).json({
      message: "Agency draft saved successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving agency draft:", error);
    res.status(500).json({ message: "Error saving agency draft." });
  }
});

// Add team member
app.post("/api/team-members", async (req, res) => {
  const { nameOfTeamMember, teamMemberEmail } = req.body;

  try {
    const query = `
      INSERT INTO manage_agency_mlsa_team_members ("Name of Team Member", "Team Member's Email")
      VALUES ($1, $2)
    `;
    await pool.query(query, [nameOfTeamMember, teamMemberEmail]);
    res.status(200).json({ message: "Team member added successfully!" });
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({ error: "Failed to add team member." });
  }
});

// Delete team member
app.delete("/api/team-members", async (req, res) => {
  const { nameOfTeamMember, teamMemberEmail } = req.body;

  try {
    const query = `
      DELETE FROM manage_agency_mlsa_team_members
      WHERE "Name of Team Member" = $1 AND "Team Member's Email" = $2
    `;
    await pool.query(query, [nameOfTeamMember, teamMemberEmail]);
    res.status(200).json({ message: "Team member deleted successfully!" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ error: "Failed to delete team member." });
  }
});

// API endpoint to update password
app.post("/api/account-settings/password", async (req, res) => {
  const { password, confirmPassword } = req.body;

  // Verify passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password in the database
    const query = `
      INSERT INTO account_settings_administrator_password ("Password", "Confirm Password")
      VALUES ($1, $2)
    `;
    await pool.query(query, [hashedPassword, hashedPassword]);

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// Endpoint to save user profile
app.post("/api/account-settings/user-profile", async (req, res) => {
  const { firstName, lastName, email, phone, biography } = req.body;

  try {
    await pool.query(
      `INSERT INTO account_settings_user_profile ("First Name", "Last Name", "Email", "Phone", "Biography")
       VALUES ($1, $2, $3, $4, $5)`,
      [firstName, lastName, email, phone, biography]
    );
    res.status(200).send({ message: "Profile saved successfully!" });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).send({ message: "Failed to save profile." });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

