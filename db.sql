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








