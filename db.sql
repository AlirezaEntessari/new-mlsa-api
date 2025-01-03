CREATE DATABASE newmlsa;

CREATE TABLE agency_information (
    "Email" VARCHAR(255),
    "Membership Plan" VARCHAR(255),
    "Staffing Agency Name" VARCHAR(255),
    "Staffing Agency EIN" VARCHAR(255),
    "Staffing Agency Website" VARCHAR(255),
    "Industry Field" VARCHAR(255),
    "Full Name (Admin)" VARCHAR(255),
    "Password" VARCHAR(255)
);

CREATE TABLE payment_details (
    "Billing Duration" VARCHAR(255),
    "Payment Method" VARCHAR(255),
    "First name" VARCHAR(255),
    "Last name" VARCHAR(255),
    "Card number" VARCHAR(255),
    "Expires" VARCHAR(255),
    "CVV" VARCHAR(255),
    "Address Line 1" VARCHAR(255),
    "Address Line 2" VARCHAR(255),
    "City" VARCHAR(255),
    "State" VARCHAR(255),
    "Country/region" VARCHAR(255),
    "Zip code" VARCHAR(255)
);

CREATE TABLE jobs_that_were_posted (
    "Job ID" SERIAL PRIMARY KEY,
    "Client Name" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Job Title" VARCHAR(255),
    "Number of people to hire for this job" VARCHAR(255),
    "Country" VARCHAR(255),
    "State" VARCHAR(255),
    "City" VARCHAR(255),
    "Zip Code" VARCHAR(255),
    "Salary Type" VARCHAR(255),
    "Amount ($)" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Location" VARCHAR(255),
    "Start Date" VARCHAR(255),
    "Experience Level" VARCHAR(255),
    "Schedule" VARCHAR(255),
    "Required Education" VARCHAR(255),
    "Required Certifications" VARCHAR(255),
    "Required Skills" VARCHAR(255),
    "Job Benefits" VARCHAR(255),
    "Job Description" VARCHAR(255),
    "Fee Agreement" VARCHAR(255),
    "Select who cannot view this job opening" VARCHAR(255),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Agency ID" INTEGER,
    "User ID" INTEGER,
    "Job Details" TEXT
);

-- Create a function to update the "Updated Date" and "Job Details"
CREATE OR REPLACE FUNCTION update_job_details()
RETURNS TRIGGER AS $$
BEGIN
    NEW."Updated Date" = CURRENT_TIMESTAMP;
    NEW."Job Details" = 
        NEW."Client Name" || ' ' ||
        NEW."Industry" || ' ' ||
        NEW."Job Title" || ' ' ||
        NEW."Number of people to hire for this job" || ' ' ||
        NEW."Country" || ' ' ||
        NEW."State" || ' ' ||
        NEW."City" || ' ' ||
        NEW."Zip Code" || ' ' ||
        NEW."Salary Type" || ' ' ||
        NEW."Amount ($)" || ' ' ||
        NEW."Job Type" || ' ' ||
        NEW."Location" || ' ' ||
        NEW."Start Date" || ' ' ||
        NEW."Experience Level" || ' ' ||
        NEW."Schedule" || ' ' ||
        NEW."Required Education" || ' ' ||
        NEW."Required Certifications" || ' ' ||
        NEW."Required Skills" || ' ' ||
        NEW."Job Benefits" || ' ' ||
        NEW."Job Description" || ' ' ||
        NEW."Fee Agreement" || ' ' ||
        NEW."Select who cannot view this job opening";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before insert and update
CREATE TRIGGER update_job_details_trigger
BEFORE INSERT OR UPDATE ON jobs_that_were_posted
FOR EACH ROW
EXECUTE FUNCTION update_job_details();

------------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE new_candidates (
    "Candidate ID" SERIAL PRIMARY KEY,
    "First and Last Name" TEXT,
    "Email" TEXT,
    "Phone Number" TEXT,
    "Employment Eligibility" TEXT,
    "Country" TEXT,
    "State" TEXT,
    "City" TEXT,
    "Preferred Job Type" VARCHAR(255),
    "Preferred Location" VARCHAR(255),
    "Willing to Relocate" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Job Title" VARCHAR(255),
    "Total Years of Experience" VARCHAR(255),
    "Education" VARCHAR(255),
    "Certifications / Credentials" VARCHAR(255),
    "Skills" VARCHAR(255),
    "Expected Salary" VARCHAR(255),
    "Availability to Start Work" VARCHAR(255),
    "LinkedIn" VARCHAR(255),
    "Portfolio Link" VARCHAR(255),
    "Shift Preference" TEXT,
    "Additional Notes" TEXT,
    "Fee Agreement" TEXT,
    "Select who cannot view this resume" TEXT,
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Candidate Details" TEXT
);

-- Create a function to update the "Updated Date" and "Candidate Details"
CREATE OR REPLACE FUNCTION update_candidate_details()
RETURNS TRIGGER AS $$
BEGIN
    NEW."Updated Date" = CURRENT_TIMESTAMP;
    NEW."Candidate Details" = 
        NEW."First and Last Name" || ' ' ||
        NEW."Email" || ' ' ||
        NEW."Phone Number" || ' ' ||
        NEW."Employment Eligibility" || ' ' ||
        NEW."Country" || ' ' ||
        NEW."State" || ' ' ||
        NEW."City" || ' ' ||
        NEW."Preferred Job Type" || ' ' ||
        NEW."Preferred Location" || ' ' ||
        NEW."Willing to Relocate" || ' ' ||
        NEW."Industry" || ' ' ||
        NEW."Job Title" || ' ' ||
        NEW."Total Years of Experience" || ' ' ||
        NEW."Education" || ' ' ||
        NEW."Certifications / Credentials" || ' ' ||
        NEW."Skills" || ' ' ||
        NEW."Expected Salary" || ' ' ||
        NEW."Availability to Start Work" || ' ' ||
        NEW."LinkedIn" || ' ' ||
        NEW."Portfolio Link" || ' ' ||
        NEW."Shift Preference" || ' ' ||
        NEW."Additional Notes" || ' ' ||
        NEW."Fee Agreement" || ' ' ||
        NEW."Select who cannot view this resume";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before insert and update
CREATE TRIGGER update_candidate_details_trigger
BEFORE INSERT OR UPDATE ON new_candidates
FOR EACH ROW
EXECUTE FUNCTION update_candidate_details();

CREATE TABLE find_candidates_test (
    "Staffing Agency" VARCHAR(255),
    "Rating" VARCHAR(255),
    "Candidate ID" SERIAL PRIMARY KEY,
    "Job Title" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Location" VARCHAR(255),
    "Experience" VARCHAR(255),
    "Action" VARCHAR(255)
);

CREATE TABLE find_jobs_test (
    "Staffing Agency" VARCHAR(255),
    "Rating" VARCHAR(255),
    "Job ID" SERIAL PRIMARY KEY,
    "Job Title" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Location" VARCHAR(255),
    "Salary" VARCHAR(255),
    "Posted Date" VARCHAR(255),
    "Action" VARCHAR(255)
);

CREATE TABLE message (
    "Agency ID" SERIAL PRIMARY KEY,
    "Message Text" TEXT,
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE find_candidates_text_search (
    "Staffing Agency" VARCHAR(255),
    "Rating" VARCHAR(255),
    "Candidate ID" SERIAL PRIMARY KEY,
    "Job Title" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Location" VARCHAR(255),
    "Experience" VARCHAR(255),
    "Action" VARCHAR(255)
);

CREATE TABLE jobs_that_were_posted (
    "Client Name" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Job Title" VARCHAR(255),
    "Number of people to hire for this job" VARCHAR(255),
    "Country" VARCHAR(255),
    "State" VARCHAR(255),
    "City" VARCHAR(255),
    "Zip Code" VARCHAR(255),
    "Salary Type" VARCHAR(255),
    "Amount ($)" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Location" VARCHAR(255),
    "Start Date" VARCHAR(255),
    "Experience Level" VARCHAR(255),
    "Schedule" VARCHAR(255),
    "Required Education" VARCHAR(255),
    "Required Certifications" VARCHAR(255),
    "Required Skills" VARCHAR(255),
    "Job Benefits" VARCHAR(255),
    "Job Description" VARCHAR(255),
    "Fee Agreement" VARCHAR(255),
    "Select who cannot view this job opening" VARCHAR(255),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Agency ID" INTEGER,
    "User ID" INTEGER,
    "Job ID" SERIAL PRIMARY KEY,
    "Job Details" TEXT
);

CREATE OR REPLACE FUNCTION update_job_details() RETURNS TRIGGER AS $$
BEGIN
    NEW."Job Details" := COALESCE(NEW."Client Name", '') || ' ' || COALESCE(NEW."Industry", '') || ' ' || COALESCE(NEW."Job Title", '') || ' ' ||
        COALESCE(NEW."Number of people to hire for this job", '') || ' ' || COALESCE(NEW."Country", '') || ' ' ||
        COALESCE(NEW."State", '') || ' ' || COALESCE(NEW."City", '') || ' ' || COALESCE(NEW."Zip Code", '') || ' ' || 
        COALESCE(NEW."Salary Type", '') || ' ' || COALESCE(NEW."Amount ($)", '') || ' ' || COALESCE(NEW."Job Type", '') || ' ' ||
        COALESCE(NEW."Location", '') || ' ' || COALESCE(NEW."Start Date", '') || ' ' || COALESCE(NEW."Experience Level", '') || ' ' ||
        COALESCE(NEW."Schedule", '') || ' ' || COALESCE(NEW."Required Education", '') || ' ' || 
        COALESCE(NEW."Required Certifications", '') || ' ' || COALESCE(NEW."Required Skills", '') || ' ' || 
        COALESCE(NEW."Job Benefits", '') || ' ' || COALESCE(NEW."Job Description", '') || ' ' || 
        COALESCE(NEW."Fee Agreement", '') || ' ' || COALESCE(NEW."Select who cannot view this job opening", '') || ' ' || 
        COALESCE(CAST(NEW."Created Date" AS VARCHAR), '') || ' ' || COALESCE(CAST(NEW."Updated Date" AS VARCHAR), '') || ' ' ||
        COALESCE(CAST(NEW."Agency ID" AS VARCHAR), '') || ' ' || COALESCE(CAST(NEW."User ID" AS VARCHAR), '') || ' ' || 
        COALESCE(CAST(NEW."Job ID" AS VARCHAR), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_details_update
BEFORE INSERT OR UPDATE ON jobs_that_were_posted
FOR EACH ROW EXECUTE FUNCTION update_job_details();

CREATE TABLE find_candidates_test (
    "Staffing Agency" VARCHAR(255),
    "Rating" VARCHAR(255),
    "Candidate ID" SERIAL PRIMARY KEY,
    "Job Title" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Location" VARCHAR(255),
    "Experience" VARCHAR(255),
    "Action" VARCHAR(255)
);

CREATE TABLE new_candidates (
    "First and Last Name" TEXT,
    "Email" TEXT,
    "Phone Number" TEXT,
    "Employment Eligibility" TEXT,
    "Country" TEXT,
    "State" TEXT,
    "City" TEXT,
    "Preferred Job Type" VARCHAR(255),
    "Preferred Location" VARCHAR(255),
    "Willing to Relocate" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Job Title" VARCHAR(255),
    "Total Years of Experience" VARCHAR(255),
    "Education" VARCHAR(255),
    "Certifications / Credentials" VARCHAR(255),
    "Skills" VARCHAR(255),
    "Expected Salary" VARCHAR(255),
    "Availability to Start Work" VARCHAR(255),
    "LinkedIn" VARCHAR(255),
    "Portfolio Link" VARCHAR(255),
    "Shift Preference" TEXT,
    "Additional Notes" TEXT,
    "Fee Agreement" TEXT,
    "Select who cannot view this resume" TEXT,
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Candidate Details" TEXT,
    "Candidate's ID" SERIAL PRIMARY KEY
);

CREATE OR REPLACE FUNCTION update_candidate_details() RETURNS TRIGGER AS $$
BEGIN
    NEW."Candidate Details" := COALESCE(NEW."First and Last Name", '') || ' ' || COALESCE(NEW."Email", '') || ' ' || COALESCE(NEW."Phone Number", '') || ' ' ||
        COALESCE(NEW."Employment Eligibility", '') || ' ' || COALESCE(NEW."Country", '') || ' ' || COALESCE(NEW."State", '') || ' ' ||
        COALESCE(NEW."City", '') || ' ' || COALESCE(NEW."Preferred Job Type", '') || ' ' || COALESCE(NEW."Preferred Location", '') || ' ' ||
        COALESCE(NEW."Willing to Relocate", '') || ' ' || COALESCE(NEW."Industry", '') || ' ' || COALESCE(NEW."Job Title", '') || ' ' ||
        COALESCE(NEW."Total Years of Experience", '') || ' ' || COALESCE(NEW."Education", '') || ' ' || COALESCE(NEW."Certifications / Credentials", '') || ' ' ||
        COALESCE(NEW."Skills", '') || ' ' || COALESCE(NEW."Expected Salary", '') || ' ' || COALESCE(NEW."Availability to Start Work", '') || ' ' ||
        COALESCE(NEW."LinkedIn", '') || ' ' || COALESCE(NEW."Portfolio Link", '') || ' ' || COALESCE(NEW."Shift Preference", '') || ' ' ||
        COALESCE(NEW."Additional Notes", '') || ' ' || COALESCE(NEW."Fee Agreement", '') || ' ' || COALESCE(NEW."Select who cannot view this resume", '') || ' ' ||
        COALESCE(CAST(NEW."Created Date" AS VARCHAR), '') || ' ' || COALESCE(CAST(NEW."Updated Date" AS VARCHAR), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidate_details_update
BEFORE INSERT OR UPDATE ON new_candidates
FOR EACH ROW EXECUTE FUNCTION update_candidate_details();

CREATE TABLE find_jobs_test (
    "Staffing Agency" VARCHAR(255),
    "Rating" VARCHAR(255),
    "Job ID" SERIAL PRIMARY KEY,
    "Job Title" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Location" VARCHAR(255),
    "Salary" VARCHAR(255),
    "Posted Date" VARCHAR(255),
    "Action" VARCHAR(255)
);

CREATE TABLE agencies (
    "Agency ID" SERIAL PRIMARY KEY,
    "Staffing Agency Name" VARCHAR(255),
    "Staffing Agency Website" VARCHAR(255),
    "Industry Field" VARCHAR(255),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the trigger function to update the "Updated Date" column
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."Updated Date" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to call the function before updating a row
CREATE TRIGGER update_updated_date_trigger
BEFORE UPDATE ON agencies
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

CREATE TABLE users (
    "User ID" SERIAL PRIMARY KEY,
    "Full Name (Admin)" VARCHAR(255),
    "Email" VARCHAR(255),
    "Password" VARCHAR(255),
    "Agency ID" INTEGER REFERENCES agencies("Agency ID"),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the trigger function to update the "Updated Date" column
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."Updated Date" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to call the function before updating a row
CREATE TRIGGER update_updated_date_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

CREATE TABLE agency_plan (
    "Plan ID" SERIAL PRIMARY KEY,
    "Agency ID" INTEGER REFERENCES agencies("Agency ID"),
    "User ID" INTEGER REFERENCES users("User ID"),
    "Plan Selected" VARCHAR(255),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the trigger function to update the "Updated Date" column
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."Updated Date" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to call the function before updating a row
CREATE TRIGGER update_updated_date_trigger
BEFORE UPDATE ON agency_plan
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

CREATE TABLE payments (
    "Payment ID" SERIAL PRIMARY KEY,
    "Name on Card" VARCHAR(255),
    "Email Address" VARCHAR(255),
    "Debit Card" VARCHAR(255),
    "Agency ID" INTEGER REFERENCES agencies("Agency ID"),
    "User ID" INTEGER REFERENCES users("User ID"),
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the trigger function to update the "Updated Date" column
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."Updated Date" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger to call the function before updating a row
CREATE TRIGGER update_updated_date_trigger
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

CREATE TABLE message (
    "Agency ID" SERIAL PRIMARY KEY,
    "Message Text" TEXT,
    "Created Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE jobs_that_were_posted
ADD COLUMN end_date timestamp without time zone,
ADD COLUMN active_flag integer DEFAULT 0;

ALTER TABLE new_candidates ADD COLUMN revision_id INTEGER DEFAULT 0;


