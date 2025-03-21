CREATE DATABASE newmlsa;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255),
    name VARCHAR(255),
    date_of_sign_up TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_time_user_logged_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_user_was_disabled TIMESTAMP
);

CREATE TABLE stripe_payment (
    id SERIAL PRIMARY KEY,
    stripe_subscription_id VARCHAR(255) NOT NULL,
    confirmation_of_payment VARCHAR(255) NOT NULL
);


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

ALTER TABLE agency_information
ADD COLUMN "User" VARCHAR(255),
ADD COLUMN "Account Active" BOOLEAN DEFAULT FALSE;

ALTER TABLE agency_information ALTER COLUMN "Account Active" DROP DEFAULT;

UPDATE agency_information
SET "Account Active" = true
WHERE "User" IN (
    SELECT "User" FROM agency_information
    WHERE "User" IS NOT NULL
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

CREATE TABLE account_settings_administrator_profile (
    "First Name" VARCHAR(255),
    "Last Name" VARCHAR(255),
    "Email" VARCHAR(255),
    "Phone" VARCHAR(50),
    "Biography" TEXT
);

CREATE TABLE account_settings_administrator_agency (
    "Name of Agency" VARCHAR(255),
    "Agency Phone" VARCHAR(50),
    "Agency Website" VARCHAR(255),
    "Facebook Link" VARCHAR(255),
    "Instagram Link" VARCHAR(255),
    "YouTube Link" VARCHAR(255),
    "About Your Agency" TEXT
);

CREATE TABLE manage_agency_mlsa_team_members (
    "Name of Team Member" VARCHAR(255),
    "Team Member's Email" VARCHAR(255),
    "Current Users" TEXT
);

CREATE TABLE account_settings_administrator_password (
    "Password" VARCHAR(255),
    "Confirm Password" VARCHAR(255)
);

CREATE TABLE account_settings_user_profile (
    "First Name" VARCHAR(255),
    "Last Name" VARCHAR(255),
    "Email" VARCHAR(255),
    "Phone" VARCHAR(50),
    "Biography" TEXT
);

CREATE TABLE account_settings_user_password (
    "Password" VARCHAR(255),
    "Confirm Password" VARCHAR(255)
);

CREATE TABLE agency_referral_form (
    "Name of Agency" VARCHAR(255),
    "Agency's Website Address" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Agency Email" VARCHAR(255),
    "Phone Number" VARCHAR(50),
    "Name" VARCHAR(255),
    "Personal Email" VARCHAR(255),
    "Your Agency" VARCHAR(255),
    "Your Message" TEXT
);

CREATE TABLE "posted_jobs" (
    "Client Name" VARCHAR(255),
    "Agency Job ID Number" VARCHAR(255),
    "Country" VARCHAR(255),
    "State" VARCHAR(255),
    "City" VARCHAR(255),
    "Zip Code" VARCHAR(255),
    "Job Title" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Openings" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Citizenship" VARCHAR(255),
    "Type of VISA" VARCHAR(255),
    "Experience Level" VARCHAR(255),
    "Salary Type" VARCHAR(255),
    "Environment" VARCHAR(255),
    "Start Date" VARCHAR(255),
    "Travel" VARCHAR(255),
    "Paid Relocation" VARCHAR(255),
    "Bonus" VARCHAR(255),
    "Required Education" VARCHAR(255),
    "Job Description" TEXT,
    "Requirement 1" TEXT,
    "Comments" TEXT,
    "Required Skills" TEXT,
    "Placement Fee" VARCHAR(255),
    "Guarantee Period" VARCHAR(255)
);

CREATE TABLE posted_candidates (
    "Candidate First Name" VARCHAR(255),
    "Middle Name" VARCHAR(255),
    "Last Name" VARCHAR(255),
    "Country" VARCHAR(255),
    "State" VARCHAR(255),
    "City" VARCHAR(255),
    "Zip Code" VARCHAR(20),
    "Primary Email" VARCHAR(255),
    "Home Phone" VARCHAR(50),
    "Best Time to Call" VARCHAR(50),
    "Cell Phone" VARCHAR(50),
    "Title" VARCHAR(255),
    "Industry" VARCHAR(255),
    "Job Type" VARCHAR(255),
    "Citizenship" VARCHAR(255),
    "Type of VISA" VARCHAR(255),
    "Experience Level" VARCHAR(255),
    "Salary Type" VARCHAR(50),
    "Environment" VARCHAR(255),
    "Start Date" VARCHAR(255),
    "Willing to Travel" VARCHAR(20),
    "Willing to Relocate" VARCHAR(20),
    "Education" VARCHAR(255),
    "LinkedIn" VARCHAR(255),
    "Facebook" VARCHAR(255),
    "Twitter (X)" VARCHAR(255),
    "Portfolio" VARCHAR(255),
    "Candidate Description/Notes" TEXT,
    "Skills" TEXT
);

CREATE TABLE agency_information_clerk (
    id SERIAL PRIMARY KEY,
    agency_name VARCHAR(255),
    agency_ein VARCHAR(255),
    website VARCHAR(255),
    location VARCHAR(255),
    industry VARCHAR(255),
    agency_id VARCHAR(255),
    referral VARCHAR(255)
);











