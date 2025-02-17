require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { applyClerkMiddleware, authenticateUser } = require('./middlewares/clerkMiddleware');

// Apply Clerk Middleware before routes
applyClerkMiddleware(app);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { clerkClient, requireAuth } = require("@clerk/express"); // clerkClient will automatically get our keys

app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});


// app.get("/", async (req, res) => {
//   const { password } = req.body;

//   await clerkClient.users
//     .verifyPassword({
//       userId: "user_2suGZVmnyt6TxlHX27GIMVvqjuQ",
//       password,
//     })
//     .then(({ verified }) => {
//       res.status(200).json({ verified, message: "Password Verified" });
//     })
//     .catch((error) => {
//       res.status(404).json(error);
//     });
// });

app.post("/", async (req, res) => {
  const userEmailAddress = "demouser3+clerk_test@example.com";

  await clerkClient.users
    .getUser("user_2suGZVmnyt6TxlHX27GIMVvqjuQ")
    .then(async (data) => {
      const userEmailData = data.emailAddresses.find(
        (emailData) => emailData.emailAddress === userEmailAddress
      );
      return userEmailData.id;
    })
    .then(
      async (userEmailId) =>
        await clerkClient.emailAddresses.deleteEmailAddress(userEmailId)
    )
    .then((data) => res.status(200).json(data));
});

app.post("/api/clerk-user-created", async (req, res) => {
  console.log(`Clerk Webhook Triggered: ${new Date().toISOString()}`);
  console.log("Incoming Webhook Data:", JSON.stringify(req.body, null, 2));

  const { data, type } = req.body;

  if (!data || !type) {
    console.error("Missing 'data' or 'type' in request body");
    return res.status(400).json({ message: "Invalid request format" });
  }

  if (type === "user.created") {
    console.log("Processing user.created event...");

    const clerkUserId = data.id;
    const name = data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}`.trim()
      : data.username ?? "Unknown User";

    const createdAt = new Date(data.created_at).toISOString();
    const lastLoggedIn = new Date().toISOString();
    const dateUserWasDisabled = null;

    try {
      console.log(`Inserting user ${clerkUserId} into database...`);

      const query = `
        INSERT INTO users (clerk_user_id, name, date_of_sign_up, last_time_user_logged_in, date_user_was_disabled)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ON CONSTRAINT unique_clerk_user_id DO UPDATE
        SET last_time_user_logged_in = EXCLUDED.last_time_user_logged_in;
      `;

      await pool.query(query, [clerkUserId, name, createdAt, lastLoggedIn, dateUserWasDisabled]);

      console.log(`User ${clerkUserId} inserted/updated successfully.`);
      return res.status(201).json({ message: "User saved successfully" });

    } catch (err) {
      console.error("Database Insert Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (type === "user.deleted") {
    console.log("Processing user.deleted event...");

    const clerkUserId = data.id;
    const dateUserWasDisabled = new Date().toISOString();

    try {
      console.log(`Marking user ${clerkUserId} as disabled...`);

      const query = `
        UPDATE users
        SET date_user_was_disabled = $1
        WHERE clerk_user_id = $2;
      `;

      await pool.query(query, [dateUserWasDisabled, clerkUserId]);

      console.log(`User ${clerkUserId} marked as disabled.`);
      return res.status(200).json({ message: "User disabled successfully" });

    } catch (err) {
      console.error("Database Update Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  console.error(`Ignoring event type: ${type}`);
  return res.status(400).json({ message: "Invalid event type" });
});








// app.post("/api/clerk-user-created", async (req, res) => {
//   console.log(`Received request on /api/clerk-user-created at ${new Date().toISOString()}`);
//   console.log("Full Request Body:", JSON.stringify(req.body, null, 2));

//   const { data, type } = req.body;

//   if (!data || !type) {
//     console.error("Missing 'data' or 'type' in request body");
//     return res.status(400).json({ message: "Invalid request format" });
//   }

//   if (type !== "user.created") {
//     console.error("Invalid event type received:", type);
//     return res.status(400).json({ message: "Invalid event type" });
//   }

//   const clerkUserId = data.id;
//   const name = `${data.first_name} ${data.last_name}`;
//   const dateOfSignUp = new Date(data.created_at * 1000);
//   const lastTimeUserLoggedIn = new Date();
//   const dateUserWasDisabled = null;

//   try {
//     console.log(`Attempting to insert user ${clerkUserId} into database`);

//     const query = `
//       INSERT INTO users (clerk_user_id, name, date_of_sign_up, last_time_user_logged_in, date_user_was_disabled)
//       VALUES ($1, $2, $3, $4, $5)
//       ON CONFLICT ON CONSTRAINT unique_clerk_user_id DO NOTHING;
//     `;

//     await pool.query(query, [
//       clerkUserId,
//       name,
//       dateOfSignUp,
//       lastTimeUserLoggedIn,
//       dateUserWasDisabled,
//     ]);

//     console.log(`User ${clerkUserId} inserted successfully.`);
//     res.status(201).json({ message: "User inserted successfully" });
//   } catch (err) {
//     console.error("Database Insert Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });



// Clerk Webhook Route for User Login (Optional)
app.post("/api/clerk-user-logged-in", async (req, res) => {
  const { data, type } = req.body;

  if (type !== "session.created") {
    return res.status(400).json({ message: "Invalid event type" });
  }

  const clerkUserId = data.user_id;
  const lastTimeUserLoggedIn = new Date();

  try {
    const query = `
      UPDATE users
      SET last_time_user_logged_in = $1
      WHERE clerk_user_id = $2;
    `;

    await pool.query(query, [lastTimeUserLoggedIn, clerkUserId]);

    res.status(200).json({ message: "User login time updated" });
  } catch (err) {
    console.error("Error updating last login time:", err);
    res.status(500).json({ error: "Failed to update login time" });
  }
});

// Clerk Webhook Route for User Deactivation (Optional)
app.post("/api/clerk-user-disabled", async (req, res) => {
  const { data, type } = req.body;

  if (type !== "user.deleted") {
    return res.status(400).json({ message: "Invalid event type" });
  }

  const clerkUserId = data.id;
  const dateUserWasDisabled = new Date();

  try {
    const query = `
      UPDATE users
      SET date_user_was_disabled = $1
      WHERE clerk_user_id = $2;
    `;

    await pool.query(query, [dateUserWasDisabled, clerkUserId]);

    res.status(200).json({ message: "User disabled date updated" });
  } catch (err) {
    console.error("Error updating disabled date:", err);
    res.status(500).json({ error: "Failed to update disabled date" });
  }
});

// app.post("/api/agency_information", async (req, res) => {
//   const {
//     email,
//     membershipPlan,
//     staffingAgencyName,
//     staffingAgencyEIN,
//     staffingAgencyWebsite,
//     industryField,
//     fullNameAdmin,
//     password,
//   } = req.body;

//   try {
//     const query = `
//       INSERT INTO agency_information (
//         "Email",
//         "Membership Plan",
//         "Staffing Agency Name",
//         "Staffing Agency EIN",
//         "Staffing Agency Website",
//         "Industry Field",
//         "Full Name (Admin)",
//         "Password"
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
//     `;

//     await pool.query(query, [
//       email,
//       membershipPlan,
//       staffingAgencyName,
//       staffingAgencyEIN,
//       staffingAgencyWebsite,
//       industryField,
//       fullNameAdmin,
//       password,
//     ]);

//     res.status(200).json({ message: "Data saved successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "An error occurred while saving data" });
//   }
// });

app.post("/api/agency_information", authenticateUser, async (req, res) => {
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

  const userId = req.user.id; // Clerk User ID from middleware
  const clerkApiKey = process.env.CLERK_SECRET_KEY;

  try {
    // Fetch user details from Clerk API
    const clerkResponse = await axios.get(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${clerkApiKey}` },
    });

    const userData = clerkResponse.data;

    // Determine if the account is active based on Clerk's data
    const isActive = !userData.banned && !userData.locked; // TRUE if user is not banned or locked

    // Hash the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert agency information (no ON CONFLICT clause)
    const query = `
      INSERT INTO agency_information (
        "Email",
        "Membership Plan",
        "Staffing Agency Name",
        "Staffing Agency EIN",
        "Staffing Agency Website",
        "Industry Field",
        "Full Name (Admin)",
        "Password",
        "User",
        "Account Active"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `;

    await pool.query(query, [
      email,
      membershipPlan,
      staffingAgencyName,
      staffingAgencyEIN,
      staffingAgencyWebsite,
      industryField,
      fullNameAdmin,
      hashedPassword, // Use the hashed password here
      userId, // Clerk User ID
      isActive, // Account Active Status
    ]);

    res.status(200).json({ message: "Agency information saved successfully", accountActive: isActive });
  } catch (err) {
    console.error("Error saving agency information:", err);
    res.status(500).json({ error: "An error occurred while saving data" });
  }
});



app.get("/api/check-user-agency", authenticateUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `SELECT * FROM agency_information WHERE "User" = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.json({ hasAgency: true, agency: result.rows[0] });
    } else {
      res.json({ hasAgency: false });
    }
  } catch (err) {
    console.error("Error checking user agency:", err);
    res.status(500).json({ error: "Internal server error" });
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

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `
      SELECT * FROM agency_information WHERE "Email" = $1 AND "Password" = $2;
    `;
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Email and password do not match" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during login" });
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

//     // Create a Stripe Checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: 'MLSA Membership',
//             },
//             unit_amount: billingDuration === 'Yearly' ? 249900 : 24900,  // $2499.00 for yearly or $249.00 for monthly
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error('Error creating Stripe Checkout session:', error);
//     res.status(500).json({ error: 'Failed to create payment session' });
//   }
// });

app.post("/api/payment-details", async (req, res) => {
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

  try {
    // Hash sensitive fields using bcrypt
    const saltRounds = 10; // Adjust as needed (higher is more secure but slower)
    const hashedCardNumber = await bcrypt.hash(cardNumber, saltRounds);
    const hashedExpires = await bcrypt.hash(expires, saltRounds);
    const hashedCvv = await bcrypt.hash(cvv, saltRounds);

    const query = `
      INSERT INTO payment_details (
        "Billing Duration", "First name", "Last name", "Card number", "Expires", "CVV", 
        "Address Line 1", "Address Line 2", "City", "State", 
        "Country/region", "Zip code"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    const values = [
      billingDuration,
      firstName,
      lastName,
      hashedCardNumber, // Store hashed card number
      hashedExpires, // Store hashed expiration date
      hashedCvv, // Store hashed CVV
      addressLine1,
      addressLine2,
      city,
      state,
      countryRegion,
      zipCode,
    ];

    await pool.query(query, values);

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "MLSA Membership",
            },
            unit_amount: billingDuration === "Yearly" ? 249900 : 24900, // $2499.00 for yearly or $249.00 for monthly
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(
      "Error creating Stripe Checkout session or storing payment details:",
      error
    );
    res
      .status(500)
      .json({ error: "Failed to create payment session or store data" });
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

// Endpoint to save user password
app.post("/api/account-settings/user-password", async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({ message: "Passwords do not match." });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert hashed password and confirm password into the database
    await pool.query(
      `INSERT INTO account_settings_user_password ("Password", "Confirm Password") 
       VALUES ($1, $2)`,
      [hashedPassword, hashedPassword]
    );

    res.status(200).send({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error saving password:", error);
    res.status(500).send({ message: "Failed to update password." });
  }
});

// Endpoint to handle referral form submission
app.post("/api/agency-referral", async (req, res) => {
  const {
    agencyName,
    websiteAddress,
    industry,
    agencyEmail,
    phoneNumber,
    yourName,
    yourEmail,
    yourAgency,
    yourMessage,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO agency_referral_form ("Name of Agency", "Agency's Website Address", "Industry", "Agency Email", "Phone Number", "Name", "Personal Email", "Your Agency", "Your Message")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        agencyName,
        websiteAddress,
        industry,
        agencyEmail,
        phoneNumber,
        yourName,
        yourEmail,
        yourAgency,
        yourMessage,
      ]
    );
    res.status(200).send({ message: "Referral submitted successfully!" });
  } catch (error) {
    console.error("Error saving referral:", error);
    res.status(500).send({ message: "Failed to submit referral." });
  }
});

app.post("/api/post-job", async (req, res) => {
  const {
    clientName,
    agencyJobId,
    country,
    state,
    city,
    zipCode,
    jobTitle,
    industry,
    jobType,
    openings,
    citizenship,
    typeOfVisa,
    experienceLevel,
    salaryType,
    environment,
    startDate,
    travel,
    paidRelocation,
    bonus,
    requiredEducation,
    jobDescription,
    requirement1,
    comments,
    requiredSkills,
    placementFee,
    guaranteePeriod,
  } = req.body;

  try {
    const query = `
      INSERT INTO "posted_jobs" (
        "Client Name", "Agency Job ID Number", "Country", "State", "City", "Zip Code",
        "Job Title", "Industry", "Job Type", "Openings", "Citizenship", "Type of VISA",
        "Experience Level", "Salary Type", "Environment", "Start Date", "Travel",
        "Paid Relocation", "Bonus", "Required Education", "Job Description", "Requirement 1",
        "Comments", "Required Skills", "Placement Fee", "Guarantee Period"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `;

    await pool.query(query, [
      clientName,
      agencyJobId,
      country,
      state,
      city,
      zipCode,
      jobTitle,
      industry,
      jobType,
      openings,
      citizenship,
      typeOfVisa,
      experienceLevel,
      salaryType,
      environment,
      startDate,
      travel,
      paidRelocation,
      bonus,
      requiredEducation,
      jobDescription,
      requirement1,
      comments,
      requiredSkills,
      placementFee,
      guaranteePeriod,
    ]);

    res.status(200).json({ message: "Job posted successfully!" });
  } catch (error) {
    console.error("Error inserting job into database:", error);
    res.status(500).json({ error: "An error occurred while posting the job." });
  }
});

app.post("/post-candidate", async (req, res) => {
  const {
    candidateFirstName,
    middleName,
    lastName,
    country,
    state,
    city,
    zipCode,
    primaryEmail,
    homePhone,
    cellPhone,
    bestTimeToCall,
    title,
    industry,
    jobType,
    citizenship,
    typeOfVisa,
    experienceLevel,
    salaryType,
    environment,
    startDate,
    willingToTravel,
    willingToRelocate,
    education,
    linkedin,
    facebook,
    twitter,
    portfolio,
    candidateDescription,
    skills,
  } = req.body;

  const query = `
    INSERT INTO posted_candidates (
      "Candidate First Name", "Middle Name", "Last Name", "Country", "State",
      "City", "Zip Code", "Primary Email", "Home Phone", "Cell Phone", "Best Time to Call",
      "Title", "Industry", "Job Type", "Citizenship", "Type of VISA",
      "Experience Level", "Salary Type", "Environment", "Start Date",
      "Willing to Travel", "Willing to Relocate", "Education", "LinkedIn",
      "Facebook", "Twitter (X)", "Portfolio", "Candidate Description/Notes", "Skills"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
  `;

  try {
    await pool.query(query, [
      candidateFirstName,
      middleName,
      lastName,
      country,
      state,
      city,
      zipCode,
      primaryEmail,
      homePhone,
      cellPhone,
      bestTimeToCall,
      title,
      industry,
      jobType,
      citizenship,
      typeOfVisa,
      experienceLevel,
      salaryType,
      environment,
      startDate,
      willingToTravel,
      willingToRelocate,
      education,
      linkedin,
      facebook,
      twitter,
      portfolio,
      candidateDescription,
      skills,
    ]);
    res.status(200).json({ message: "Candidate posted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post candidate." });
  }
});

// Route to handle Stripe Checkout session creation
app.post("/api/create-checkout-session", async (req, res) => {
  const { email, membershipPlan } = req.body;

  try {
    // Determine the amount based on the membership plan
    const amount = membershipPlan === "Yearly" ? 249900 : 24900; // $2499.00 or $249.00 in cents

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "MLSA Membership",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email, // Pre-fill customer email if available
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    // Send the Checkout session URL to the client
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

app.get("/api/check-agency", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    const query = `SELECT COUNT(*) FROM agency_information WHERE "Email" = $1`;
    const result = await pool.query(query, [email]);

    if (result.rows[0].count > 0) {
      res.json({ hasAgency: true });
    } else {
      res.json({ hasAgency: false });
    }
  } catch (err) {
    console.error("Error checking agency:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
