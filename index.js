require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

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


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* The prior backend code is below and we are going to reuse it as you mentioned */

// const express = require("express");
// const app = express();
// const cors = require("cors");
const receivedRequestsData = require("./data/receivedRequestsData.json");
const receivedApplicants = require("./data/receivedApplicants.json");
const receivedRequests = require("./data/receivedRequests.json");
const cardsData = require("./data/cardsData.json");
const mapData = require("./data/jobsPerState.json");
const descriptionOfJobsPerState = require("./data/descriptionofJobsPerState.json");
const cardsDataMyJobsPage = require("./data/cardsDataMyJobsPage.json");
const myJobsTableDashboard = require("./data/myJobsDashboard.json");
const industryJobs = require("./data/industryJobs.json");
const pool = require("./db");
const mongoose = require("mongoose");
const Message = require("./Message"); // Import the Message model
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost/messages");

// Define your static HTML data
const receivedApplicantsData = [
  {
    job: "CT Tech at Berkshire Medical Center Travel",
    status: "Active",
    candidates: 3,
    remainingDays: 27,
  },
  {
    job: "RN - ER at Berkshire Medical Center Full Time",
    status: "Active",
    candidates: 5,
    remainingDays: 10,
  },
  {
    job: "Ultrasound Tech at Sarah Bush Lincoln Health Full Time",
    status: "Expired",
    candidates: 0,
    expirationDate: "Dec, 19 2023",
  },
];

// Define your REST API route
app.get("/api/receivedApplicants", (req, res) => {
  res.json(receivedApplicantsData);
});

// Route to fetch data for received requests table
app.get("/api/receivedRequests", (req, res) => {
  res.json(receivedRequestsData);
});

// Route to fetch data for received applicants table
app.get("/api/receivedApplicantsData", (req, res) => {
  res.json(receivedApplicants);
});

// Route to fetch data for received applicants table
app.get("/api/receivedRequestsData", (req, res) => {
  res.json(receivedRequests);
});

// Route to fetch cards data
app.get("/api/cardsData", (req, res) => {
  res.json(cardsData);
});

// Route to fetch map data
app.get("/api/mapData", (req, res) => {
  res.json(mapData);
});

// Route to fetch detailed description of the jobs per state to populate the cards
app.get("/api/jobsPerState", (req, res) => {
  res.json(descriptionOfJobsPerState);
});

// Route to fetch the four cards data for the My Jobs Page
app.get("/api/cardsDataMyJobsPage", (req, res) => {
  res.json(cardsDataMyJobsPage);
});

// Route to fetch the table data for the My Jobs Link in the Dashboard drop-down
app.get("/api/myJobsTableDashboard", (req, res) => {
  res.json(myJobsTableDashboard);
});

// Route to fetch the table data for the My Jobs Link in the Dashboard drop-down and convert it to an array
app.get("/api/myJobsTableDashboardArray", (req, res) => {
  // Convert the rows to an array
  const rowsArray = Object.values(myJobsTableDashboard)
    .filter(row => typeof row === "object" && !Array.isArray(row));

  // Send the array of rows as the response
  res.json(rowsArray);
});


// Route to fetch Industry Jobs Table Data
app.get("/api/industryJobs", (req, res) => {
  res.json(industryJobs);
});

app.get("/api/table_data", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM job_activities;");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/table_data_with_columns", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM job_activities;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-job-activities-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_job_activities_filtered;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/allAvailableCandidates", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM all_available_candidates;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/all-available-candidates-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM all_available_candidates_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/myCandidatesCards", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidates_cards;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/myCandidates", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_candidates;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidates-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_candidates_filtered;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/myCandidateActivities", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidate-activities-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidate-activities-post", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_post;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidate-activities-three", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_three;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidate-activities-four", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_four;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidate-activities-five", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_five;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/myCandidateActivitiesProcessPage", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM my_candidate_activities_process_page;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/recruitmentAgreements", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 1;
    const offset = (page - 1) * limit;
    const countQuery = "SELECT COUNT(*) AS total FROM recruitment_agreements;";
    const totalCount = await pool.query(countQuery);
    const totalRows = totalCount.rows[0].total;
    const query = `
      SELECT * FROM recruitment_agreements
      ORDER BY "Candidates' ID"
      LIMIT ${limit}
      OFFSET ${offset};
    `;
    const { rows, fields } = await pool.query(query);
    const columnNames = fields.map((field) => field.name);
    const totalPages = Math.ceil(totalRows / limit);

    res.json({ columnNames, rows, totalPages });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/recruitment-agreements-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM recruitment_agreements_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.get("/api/jobAgreements", async (req, res) => {
//   try {
//     const { rows, fields } = await pool.query("SELECT * FROM job_agreements;");
//     const columnNames = fields.map((field) => field.name);
//     res.json({ columnNames, rows });
//   } catch (error) {
//     console.error("Error fetching table data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.get("/api/jobAgreements", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default limit is 5 records per page
    const offset = (page - 1) * limit;

    const { rows, fields } = await pool.query(
      `SELECT * FROM job_agreements LIMIT ${limit} OFFSET ${offset};`
    );
    const columnNames = fields.map((field) => field.name);

    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/job-agreements-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM job_agreements_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/all-staffing-agencies", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM all_staffing_agencies;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/all-staffing-agencies-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM all_staffing_agencies_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-partners", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_partners;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-partners-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_partners_filtered;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/agency-partner-requests", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM agency_partner_requests;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/agency-partner-requests-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query(
      "SELECT * FROM agency_partner_requests_filtered;"
    );
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/industry-jobs", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM industry_jobs;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/industry-jobs-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM industry_jobs_filtered;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-jobs-filtered", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM my_jobs_filtered;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/archive-jobs", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM archive_jobs;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/archived-candidates", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM archived_candidates;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/mlsa-reports-my-candidates", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM mlsa_reports_my_candidates;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/mlsa-reports-my-jobs", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM mlsa_reports_my_jobs;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/mlsa-reports-my-partners", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM mlsa_reports_my_partners;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-jobs-posted", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM jobs_that_were_posted;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Close jobs
app.post("/api/close-jobs", async (req, res) => {
  const { jobIds } = req.body;
  const endDate = new Date();
  try {
    await pool.query(
      "UPDATE jobs_that_were_posted SET end_date = $1, active_flag = 1 WHERE \"Job ID\" = ANY($2::int[])",
      [endDate, jobIds]
    );
    res.status(200).json({ message: "Jobs closed successfully" });
  } catch (error) {
    console.error("Error closing jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Re-open job
app.post("/api/reopen-job", async (req, res) => {
  const { jobId } = req.body;
  const startDate = new Date();
  try {
    const { rows } = await pool.query(
      "SELECT * FROM jobs_that_were_posted WHERE \"Job ID\" = $1",
      [jobId]
    );
    const job = rows[0];
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    const newJob = { ...job, end_date: null, active_flag: 0, "Start Date": startDate };
    delete newJob["Job ID"];
    const insertQuery = `
      INSERT INTO jobs_that_were_posted (${Object.keys(newJob).join(", ")})
      VALUES (${Object.keys(newJob).map((_, i) => `$${i + 1}`).join(", ")})
      RETURNING "Job ID"
    `;
    const { rows: newRows } = await pool.query(insertQuery, Object.values(newJob));
    res.status(200).json({ message: "Job reopened successfully", newJobId: newRows[0]["Job ID"] });
  } catch (error) {
    console.error("Error reopening job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/my-candidates-posted", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM new_candidates");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new candidate revision
app.post('/api/candidate/revise', async (req, res) => {
  try {
      const { candidateId } = req.body;

      // Fetch the current candidate data
      const { rows: candidateRows } = await pool.query('SELECT * FROM new_candidates WHERE "Candidate\'s ID" = $1 AND revision_id = 0', [candidateId]);
      
      if (candidateRows.length === 0) {
          return res.status(404).json({ error: 'Candidate not found' });
      }

      const candidateData = candidateRows[0];

      // Copy the current candidate data to create a new revision
      await pool.query(`
          INSERT INTO new_candidates (
              "First and Last Name", "Email", "Phone Number", "Employment Eligibility", "Country", 
              "State", "City", "Preferred Job Type", "Preferred Location", "Willing to Relocate", 
              "Industry", "Job Title", "Total Years of Experience", "Education", "Certifications / Credentials", 
              "Skills", "Expected Salary", "Availability to Start Work", "LinkedIn", "Portfolio Link", 
              "Shift Preference", "Additional Notes", "Fee Agreement", "Select who cannot view this resume", 
              "Created Date", "Updated Date", "Candidate Details", "Candidate's ID", revision_id
          ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
              $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 1
          )`, [
              candidateData["First and Last Name"], candidateData["Email"], candidateData["Phone Number"], candidateData["Employment Eligibility"], candidateData["Country"],
              candidateData["State"], candidateData["City"], candidateData["Preferred Job Type"], candidateData["Preferred Location"], candidateData["Willing to Relocate"],
              candidateData["Industry"], candidateData["Job Title"], candidateData["Total Years of Experience"], candidateData["Education"], candidateData["Certifications / Credentials"],
              candidateData["Skills"], candidateData["Expected Salary"], candidateData["Availability to Start Work"], candidateData["LinkedIn"], candidateData["Portfolio Link"],
              candidateData["Shift Preference"], candidateData["Additional Notes"], candidateData["Fee Agreement"], candidateData["Select who cannot view this resume"],
              candidateData["Created Date"], candidateData["Updated Date"], candidateData["Candidate Details"], candidateData["Candidate's ID"]
          ]);

      // Update the original candidate entry to set the new revision_id to 0
      await pool.query('UPDATE new_candidates SET revision_id = 0 WHERE "Candidate\'s ID" = $1 AND revision_id = 1', [candidateId]);

      res.status(200).json({ message: 'Candidate revision created successfully' });
  } catch (error) {
      console.error('Error creating candidate revision:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing candidate revision
app.put('/api/candidate/update', async (req, res) => {
  try {
      const { candidateId, updatedData } = req.body;

      await pool.query(`
          UPDATE new_candidates SET 
              "First and Last Name" = $1, "Email" = $2, "Phone Number" = $3, "Employment Eligibility" = $4, "Country" = $5, 
              "State" = $6, "City" = $7, "Preferred Job Type" = $8, "Preferred Location" = $9, "Willing to Relocate" = $10, 
              "Industry" = $11, "Job Title" = $12, "Total Years of Experience" = $13, "Education" = $14, "Certifications / Credentials" = $15, 
              "Skills" = $16, "Expected Salary" = $17, "Availability to Start Work" = $18, "LinkedIn" = $19, "Portfolio Link" = $20, 
              "Shift Preference" = $21, "Additional Notes" = $22, "Fee Agreement" = $23, "Select who cannot view this resume" = $24, 
              "Updated Date" = CURRENT_TIMESTAMP
          WHERE "Candidate's ID" = $25 AND revision_id = 0
      `, [
          updatedData["First and Last Name"], updatedData["Email"], updatedData["Phone Number"], updatedData["Employment Eligibility"], updatedData["Country"],
          updatedData["State"], updatedData["City"], updatedData["Preferred Job Type"], updatedData["Preferred Location"], updatedData["Willing to Relocate"],
          updatedData["Industry"], updatedData["Job Title"], updatedData["Total Years of Experience"], updatedData["Education"], updatedData["Certifications / Credentials"],
          updatedData["Skills"], updatedData["Expected Salary"], updatedData["Availability to Start Work"], updatedData["LinkedIn"], updatedData["Portfolio Link"],
          updatedData["Shift Preference"], updatedData["Additional Notes"], updatedData["Fee Agreement"], updatedData["Select who cannot view this resume"],
          candidateId
      ]);

      res.status(200).json({ message: 'Candidate updated successfully' });
  } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Create a job

app.post("/posted-jobs", async (req, res) => {
  try {
    const {
      clientName,
      city,
      zipCode,
      amount,
      requiredEducation,
      requiredCertifications,
      jobTitle,
      requiredSkills,
      jobDescription,
      feeAgreement,
      cannotView,
    } = req.body;
    const newJob = await pool.query(
      `INSERT INTO job_postings (client_name, city, zip_code, amount, required_education, required_certifications, job_title, 
        required_skills, job_description, fee_agreement, cannot_view) 
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        clientName,
        city,
        zipCode,
        amount,
        requiredEducation,
        requiredCertifications,
        jobTitle,
        requiredSkills,
        jobDescription,
        feeAgreement,
        cannotView,
      ]
    );

    res.json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Jobs that were posted

app.post("/jobs-that-were-posted", async (req, res) => {
  try {
    const {
      clientName,
      industry,
      jobTitle,
      numberOfPeopleToHire,
      country,
      state,
      city,
      zipCode,
      salaryType,
      amount,
      jobType,
      location,
      startDate,
      experienceLevel,
      requiredEducation,
      requiredCertifications,
      requiredSkills,
      jobDescription,
      feeAgreement,
      cannotView,
    } = req.body;
    const newJob = await pool.query(
      `INSERT INTO jobs_that_were_posted ("Client Name", "Industry", "Job Title", "Number of people to hire for this job", "Country", "State", "City", 
        "Zip Code", "Salary Type", "Amount ($)", "Job Type", "Location", "Start Date", "Experience Level", "Required Education", "Required Certifications",
        "Required Skills", "Job Description", "Fee Agreement", "Select who cannot view this job opening") 
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [
        clientName,
        industry,
        jobTitle,
        numberOfPeopleToHire,
        country,
        state,
        city,
        zipCode,
        salaryType,
        amount,
        jobType,
        location,
        startDate,
        experienceLevel,
        requiredEducation,
        requiredCertifications,
        requiredSkills,
        jobDescription,
        feeAgreement,
        cannotView,
      ]
    );
    res.json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/jobs-that-were-posted/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      industry,
      jobTitle,
      numberOfPeopleToHire,
      country,
      state,
      city,
      zipCode,
      salaryType,
      amount,
      jobType,
      location,
      startDate,
      experienceLevel,
      requiredEducation,
      requiredCertifications,
      requiredSkills,
      jobDescription,
      feeAgreement,
      cannotView,
    } = req.body;
    const updateJob = await pool.query(
      `UPDATE jobs_that_were_posted SET
        "Client Name" = $1, "Industry" = $2, "Job Title" = $3, 
        "Number of people to hire for this job" = $4, "Country" = $5, 
        "State" = $6, "City" = $7, "Zip Code" = $8, "Salary Type" = $9, 
        "Amount ($)" = $10, "Job Type" = $11, "Location" = $12, 
        "Start Date" = $13, "Experience Level" = $14, 
        "Required Education" = $15, "Required Certifications" = $16, 
        "Required Skills" = $17, "Job Description" = $18, 
        "Fee Agreement" = $19, "Select who cannot view this job opening" = $20,
        "Updated Date" = CURRENT_TIMESTAMP
      WHERE "Job ID" = $21 RETURNING *`,
      [
        clientName,
        industry,
        jobTitle,
        numberOfPeopleToHire,
        country,
        state,
        city,
        zipCode,
        salaryType,
        amount,
        jobType,
        location,
        startDate,
        experienceLevel,
        requiredEducation,
        requiredCertifications,
        requiredSkills,
        jobDescription,
        feeAgreement,
        cannotView,
        id,
      ]
    );
    res.json(updateJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// Add a new route on the server to handle button clicks for post jobs pages
app.post("/jobs-that-were-posted/schedule", async (req, res) => {
  try {
    const { schedule } = req.body;
    // console.log("Received Button Text:", shiftPreference);

    // Insert the buttonText into the PostgreSQL database
    const newSchedule = await pool.query(
      `INSERT INTO jobs_that_were_posted ("Schedule") VALUES ($1) RETURNING *`,
      [schedule]
    );

    res.json(newSchedule.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Add a new route on the server to handle button clicks for the Job Benefits column of the post jobs page
app.post("/jobs-that-were-posted/job-benefits", async (req, res) => {
  try {
    const { jobBenefits } = req.body;
    // console.log("Received Button Text:", shiftPreference);

    // Insert the buttonText into the PostgreSQL database
    const newJobBenefits = await pool.query(
      `INSERT INTO jobs_that_were_posted ("Job Benefits") VALUES ($1) RETURNING *`,
      [jobBenefits]
    );

    res.json(newJobBenefits.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// app.post("/post-status", async (req, res) => {
//   try {
//     const {
//       status
//     } = req.body;
//     const newStatus = await pool.query(
//       `INSERT INTO my_candidate_activities_three ("Status") 
//        VALUES($1) RETURNING *`,
//       [
//         status
//       ]
//     );
//     res.json(newStatus.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//   }
// });

app.post("/post-status", async (req, res) => {
  try {
    const { status } = req.body;

    // Insert the new status into the database
    await pool.query(
      `INSERT INTO my_candidate_activities_three ("Status") 
       VALUES ($1)`,
      [status]
    );

    // Fetch the updated data from the database
    const updatedData = await pool.query(
      `SELECT * FROM my_candidate_activities_three`
    );

    // Send the updated data back to the client
    res.json(updatedData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/post-status-two", async (req, res) => {
  try {
    const { status } = req.body;

    // Insert the new status into the database
    await pool.query(
      `INSERT INTO my_candidate_activities_four ("Status") 
       VALUES ($1)`,
      [status]
    );

    // Fetch the updated data from the database
    const updatedData = await pool.query(
      `SELECT * FROM my_candidate_activities_four`
    );

    // Send the updated data back to the client
    res.json(updatedData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/post-status-three", async (req, res) => {
  try {
    const { status } = req.body;

    // Insert the new status into the database
    await pool.query(
      `INSERT INTO my_candidate_activities_five ("Status") 
       VALUES ($1)`,
      [status]
    );

    // Fetch the updated data from the database
    const updatedData = await pool.query(
      `SELECT * FROM my_candidate_activities_five`
    );

    // Send the updated data back to the client
    res.json(updatedData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/clear-rows", async (req, res) => {
  try {
    // Delete all rows except for the first one
    const queryString = `
      DELETE FROM my_candidate_activities_three
      WHERE ctid NOT IN (
        SELECT min(ctid)
        FROM my_candidate_activities_three
      )
    `;
    await pool.query(queryString);

    res.status(200).send("Rows cleared successfully.");
  } catch (error) {
    console.error("Error clearing rows:", error);
    res.status(500).send("Internal server error.");
  }
});

app.delete("/clear-rows-two", async (req, res) => {
  try {
    // Delete all rows except for the first one
    const queryString = `
      DELETE FROM my_candidate_activities_four
      WHERE ctid NOT IN (
        SELECT min(ctid)
        FROM my_candidate_activities_four
      )
    `;
    await pool.query(queryString);

    res.status(200).send("Rows cleared successfully.");
  } catch (error) {
    console.error("Error clearing rows:", error);
    res.status(500).send("Internal server error.");
  }
});

app.delete("/clear-rows-three", async (req, res) => {
  try {
    // Delete all rows except for the first one
    const queryString = `
      DELETE FROM my_candidate_activities_five
      WHERE ctid NOT IN (
        SELECT min(ctid)
        FROM my_candidate_activities_five
      )
    `;
    await pool.query(queryString);

    res.status(200).send("Rows cleared successfully.");
  } catch (error) {
    console.error("Error clearing rows:", error);
    res.status(500).send("Internal server error.");
  }
});


app.post("/new-candidates", async (req, res) => {
  try {
    const {
      firstLastName,
      email,
      phoneNumber,
      employmentEligibility,
      country,
      state,
      city,
      preferredJobType,
      preferredLocation,
      willingToRelocate,
      industry,
      jobTitle,
      totalYearsOfExperience,
      education,
      certificationsCredentials,
      skills,
      expectedSalary,
      availabilityToStartWork,
      linkedIn,
      portfolioLink,
      additionalNotes,
      feeAgreement,
      cannotView,
    } = req.body;

    const newCandidate = await pool.query(
      `INSERT INTO new_candidates ("First and Last Name", "Email", "Phone Number", "Employment Eligibility", 
      "Country", "State", "City", "Preferred Job Type", "Preferred Location", "Willing to Relocate", "Industry",
      "Job Title", "Total Years of Experience", "Education", "Certifications / Credentials", "Skills", "Expected Salary", 
      "Availability to Start Work", "LinkedIn", "Portfolio Link", "Additional Notes", "Fee Agreement", 
      "Select who cannot view this resume")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [
        firstLastName,
        email,
        phoneNumber,
        employmentEligibility,
        country,
        state,
        city,
        preferredJobType,
        preferredLocation,
        willingToRelocate,
        industry,
        jobTitle,
        totalYearsOfExperience,
        education,
        certificationsCredentials,
        skills,
        expectedSalary,
        availabilityToStartWork,
        linkedIn,
        portfolioLink,
        additionalNotes,
        feeAgreement,
        cannotView,
      ]
    );
    res.json(newCandidate.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Add a new route on the server to handle button clicks
app.post("/new-candidates/shift-preference", async (req, res) => {
  try {
    const { shiftPreference } = req.body;
    // console.log("Received Button Text:", shiftPreference);

    // Insert the buttonText into the PostgreSQL database
    const newShiftPreference = await pool.query(
      `INSERT INTO new_candidates ("Shift Preference") VALUES ($1) RETURNING *`,
      [shiftPreference]
    );

    res.json(newShiftPreference.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.put("/new-candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstLastName,
      email,
      phoneNumber,
      employmentEligibility,
      country,
      state,
      city,
      preferredJobType,
      preferredLocation,
      willingToRelocate,
      industry,
      jobTitle,
      totalYearsOfExperience,
      education,
      certificationsCredentials,
      skills,
      expectedSalary,
      availabilityToStartWork,
      linkedIn,
      portfolioLink,
      additionalNotes,
      feeAgreement,
      cannotView,
    } = req.body;

    const updateCandidate = await pool.query(
      `UPDATE new_candidates SET
        "First and Last Name" = $1, 
        "Email" = $2, 
        "Phone Number" = $3, 
        "Employment Eligibility" = $4, 
        "Country" = $5, 
        "State" = $6, 
        "City" = $7, 
        "Preferred Job Type" = $8, 
        "Preferred Location" = $9, 
        "Willing to Relocate" = $10, 
        "Industry" = $11, 
        "Job Title" = $12, 
        "Total Years of Experience" = $13, 
        "Education" = $14, 
        "Certifications / Credentials" = $15, 
        "Skills" = $16, 
        "Expected Salary" = $17, 
        "Availability to Start Work" = $18, 
        "LinkedIn" = $19, 
        "Portfolio Link" = $20, 
        "Additional Notes" = $21, 
        "Fee Agreement" = $22, 
        "Select who cannot view this resume" = $23, 
        "Updated Date" = CURRENT_TIMESTAMP
      WHERE "Candidate ID" = $24 RETURNING *`,
      [
        firstLastName,
        email,
        phoneNumber,
        employmentEligibility,
        country,
        state,
        city,
        preferredJobType,
        preferredLocation,
        willingToRelocate,
        industry,
        jobTitle,
        totalYearsOfExperience,
        education,
        certificationsCredentials,
        skills,
        expectedSalary,
        availabilityToStartWork,
        linkedIn,
        portfolioLink,
        additionalNotes,
        feeAgreement,
        cannotView,
        id,
      ]
    );

    res.json(updateCandidate.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


app.post("/process", (req, res) => {
  // Retrieve data from request body or query parameters
  const {
    candidateid,
    candidatename,
    staffingagency,
    partner,
    rating,
    jobtitle,
    industry,
    location,
    lastactivitydate,
    status,
    action,
  } = req.query;

  // Update database with new status ("Offer Status")
  // Send email to candidate

  // Assuming you have a function to update the status in the database
  updateStatusInDatabase(candidate, "Offer Status");

  // Send response with new status and action items
  const newStatus = "Offer";
  const newActionItems = ["Hire"];
  res.json({ status: newStatus, actionItems: newActionItems });
});

// Define your API endpoint for the process page
app.post("/api/process-candidate", async (req, res) => {
  try {
    // Extract data from the request payload
    const { jobId, agency, candidateId, status } = req.body;

    // Perform database update to change candidate status to Offer Status
    const query = `
      UPDATE your_table_name
      SET status = $1
      WHERE candidate_id = $2;
    `;
    await pool.query(query, ["Offered", candidateId]);

    // Send email to the candidate (not implemented in this example)

    // Respond with success message
    res.status(200).json({ message: "Candidate offer processed successfully" });
  } catch (error) {
    console.error("Error processing candidate offer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/update-status", async (req, res) => {
  try {
    const { id, status } = req.body; // Assuming you also pass the candidate ID along with the new status

    // Update the status in the database for the specified candidate ID
    await pool.query(
      `UPDATE my_candidate_activities_five 
       SET "Status" = $1 
       WHERE "Candidates' ID" = $2`,
      [status, id]
    );

    res.status(200).send("Status updated successfully.");
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send("Internal server error.");
  }
});

// app.post('/api/register', async (req, res) => {
//   const { staffingAgencyName, staffingAgencyWebsite, industryField, fullNameAdmin, email, password } = req.body;

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // Insert into agencies table
//     const agencyInsertQuery = `
//       INSERT INTO agencies ("Staffing Agency Name", "Staffing Agency Website", "Industry Field")
//       VALUES ($1, $2, $3)
//       RETURNING "Agency ID";
//     `;
//     const agencyInsertValues = [staffingAgencyName, staffingAgencyWebsite, industryField];
//     const agencyResult = await client.query(agencyInsertQuery, agencyInsertValues);
//     const agencyId = agencyResult.rows[0]["Agency ID"];

//     // Insert into users table
//     const userInsertQuery = `
//       INSERT INTO users ("Full Name (Admin)", "Email", "Password", "Agency ID")
//       VALUES ($1, $2, $3, $4)
//       RETURNING "User ID";
//     `;
//     const userInsertValues = [fullNameAdmin, email, password, agencyId];
//     const userResult = await client.query(userInsertQuery, userInsertValues);
//     const userId = userResult.rows[0]["User ID"];

//     await client.query('COMMIT');
//     res.status(200).send({ message: 'Registration successful', agency_id: agencyId, user_id: userId });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error during registration', error);
//     res.status(500).send({ message: 'Registration failed' });
//   } finally {
//     client.release();
//   }
// });

// Registration route
app.post('/api/register', async (req, res) => {
  const { staffingAgencyName, staffingAgencyWebsite, industryField, fullNameAdmin, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert into agencies table
    const agencyInsertQuery = `
      INSERT INTO agencies ("Staffing Agency Name", "Staffing Agency Website", "Industry Field")
      VALUES ($1, $2, $3)
      RETURNING "Agency ID";
    `;
    const agencyInsertValues = [staffingAgencyName, staffingAgencyWebsite, industryField];
    const agencyResult = await client.query(agencyInsertQuery, agencyInsertValues);
    const agencyId = agencyResult.rows[0]["Agency ID"];

    // Insert into users table
    const userInsertQuery = `
      INSERT INTO users ("Full Name (Admin)", "Email", "Password", "Agency ID")
      VALUES ($1, $2, $3, $4)
      RETURNING "User ID";
    `;
    const userInsertValues = [fullNameAdmin, email, hashedPassword, agencyId];
    const userResult = await client.query(userInsertQuery, userInsertValues);
    const userId = userResult.rows[0]["User ID"];

    await client.query('COMMIT');
    res.status(200).send({ message: 'Registration successful', agency_id: agencyId, user_id: userId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during registration', error);
    res.status(500).send({ message: 'Registration failed' });
  } finally {
    client.release();
  }
});


app.post('/api/payment', async (req, res) => {
  const { nameOnCard, emailAddress, debitCard, agencyId, userId } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert into payments table
    const paymentInsertQuery = `
      INSERT INTO payments ("Name on Card", "Email Address", "Debit Card", "Agency ID", "User ID", "Created Date", "Updated Date")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING "Payment ID";
    `;
    const paymentInsertValues = [nameOnCard, emailAddress, debitCard, agencyId, userId];
    await client.query(paymentInsertQuery, paymentInsertValues);

    await client.query('COMMIT');
    res.status(200).send({ message: 'Payment successful' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during payment', error);
    res.status(500).send({ message: 'Payment failed' });
  } finally {
    client.release();
  }
});



app.post('/api/select-plan', async (req, res) => {
  const { agency_id, user_id, plan_selected } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert into agency_plan table
    const insertPlanQuery = `
      INSERT INTO agency_plan ("Agency ID", "User ID", "Plan Selected", "Created Date", "Updated Date")
      VALUES ($1, $2, $3, NOW(), NOW())
    `;
    const insertPlanValues = [agency_id, user_id, plan_selected];
    await client.query(insertPlanQuery, insertPlanValues);

    await client.query('COMMIT');
    res.status(200).send({ message: 'Plan selected successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error selecting plan', error);
    res.status(500).send({ message: 'Plan selection failed' });
  } finally {
    client.release();
  }
});

app.post('/api/find-candidates', async (req, res) => {
  const { jobTitle, jobType, industry, location, experience } = req.body;

  try {
    const query = `
      SELECT * FROM new_candidates
      WHERE "Job Title" ILIKE $1
        AND "Preferred Job Type" ILIKE $2
        AND "Industry" ILIKE $3
        AND "Preferred Location" ILIKE $4
        AND "Total Years of Experience"::text ILIKE $5
      LIMIT 5;
    `;

    const values = [`%${jobTitle}%`, `%${jobType}%`, `%${industry}%`, `%${location}%`, `%${experience}%`];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/api/find-candidates-test", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM find_candidates_test;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/find-candidates-text-search", async (req, res) => {
  try {
    const { keyword } = req.query;

    // Ensure keyword is sanitized and transformed for tsquery
    const sanitizedKeyword = keyword.trim().replace(/ /g, " & ");

    const query = `
      SELECT * FROM find_candidates_test
      WHERE to_tsvector('english', "Staffing Agency" || ' ' || "Rating" || ' ' || "Candidate ID" || ' ' || "Job Title" || ' ' || "Job Type" || ' ' || "Industry" || ' ' || "Location" || ' ' || "Experience" || ' ' || "Action")
      @@ to_tsquery($1);
    `;

    const { rows, fields } = await pool.query(query, [sanitizedKeyword]);
    const columnNames = fields.map(field => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/find-candidates-text-search-two', async (req, res) => {
  const { keyword } = req.query;
  try {
    const queryText = `
      SELECT * FROM find_candidates_text_search
      WHERE "Staffing Agency" ILIKE $1
        OR "Rating" ILIKE $1
        OR "Job Title" ILIKE $1
        OR "Job Type" ILIKE $1
        OR "Industry" ILIKE $1
        OR "Location" ILIKE $1
        OR "Experience" ILIKE $1
        OR "Action" ILIKE $1
    `;
    const values = [`%${keyword}%`];
    const result = await pool.query(queryText, values);

    res.json({
      columnNames: result.fields.map(field => field.name),
      rows: result.rows,
    });
  } catch (err) {
    console.error('Error performing text search:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/find-jobs-test", async (req, res) => {
  try {
    const { rows, fields } = await pool.query("SELECT * FROM find_jobs_test;");
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/find-jobs-text-search', async (req, res) => {
  try {
    const { typeOfSearch, searchQuery } = req.query;

    let query = '';
    if (typeOfSearch === 'job-organized-resume') {
      query = `
        SELECT * FROM find_jobs_test 
        WHERE to_tsvector('english', "Job Title" || ' ' || "Industry" || ' ' || "Location" || ' ' || "Salary" || ' ' || "Posted Date") @@ to_tsquery($1)
        LIMIT 5;
      `;
    } else if (typeOfSearch === 'resume-organized-job') {
      // Modify the query as needed for the resume-organized-job search
      query = `
        SELECT * FROM find_jobs_test 
        WHERE to_tsvector('english', "Job Title" || ' ' || "Industry" || ' ' || "Location" || ' ' || "Salary" || ' ' || "Posted Date") @@ to_tsquery($1)
        LIMIT 5;
      `;
    }

    const { rows, fields } = await pool.query(query, [searchQuery]);
    const columnNames = fields.map((field) => field.name);
    res.json({ columnNames, rows });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to save message
app.post('/api/messages', async (req, res) => {
  const { message_text } = req.body;

  if (!message_text) {
    res.status(400).json({ error: 'Message text is required.' });
    return;
  }

  try {
    const query = `
      INSERT INTO message ("Message Text")
      VALUES ($1)
      RETURNING *;
    `;
    const values = [message_text];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting message', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all messages
app.get('/api/messages', async (req, res) => {
  try {
    const query = 'SELECT * FROM message ORDER BY "Created Date" DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching messages', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to save message
app.post('/api/messages-mongo', async (req, res) => {
  const { messageText } = req.body;

  if (!messageText) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    const message = new Message({ messageText });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Error inserting message', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all messages
app.get('/api/messages-mongo', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdDate: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const client = await pool.connect();
  try {
    const userQuery = 'SELECT "User ID", "Password" FROM users WHERE "Email" = $1';
    const userResult = await client.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user["Password"]);

    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    res.status(200).send({ message: 'Login successful', user_id: user["User ID"] });
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).send({ message: 'Login failed' });
  } finally {
    client.release();
  }
});


// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

