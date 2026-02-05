# Acceptance Test Suite: UC-01 Register Account

## Assumptions (from UC-01)
- Registration happens via a **registration form**.
- System **validates email + password**.
- On success: **account is created + stored**, user is **redirected to login**.
- On failure: **no account is created**, user sees **error message**, remains able to correct and resubmit.

---

## Test Data Sets

Use these consistently across tests:

### Valid user data (V1)
- Name: Test User
- Email: `newuser001@example.com` *(not already registered)*
- Password: `ValidPass123!` *(meets password rules)*

### Duplicate email (D1)
- Email: `existing@example.com` *(already registered)*

### Invalid emails (E1)
- `bademail`
- `bad@email`
- `@example.com`
- `user@.com`

### Weak passwords (P1) *(examples; exact rule may vary)*
- `short`
- `password`
- `12345678`
- `NoSpecialChar1`

---

## Acceptance Tests

### UC01-AT-01 — Successful registration (Happy Path)
**Goal:** Validate that a new account can be created.

- **Given** the user is on the Registration page and is not logged in  
- **When** the user enters V1 data and submits the form  
- **Then** the system validates the inputs  
- **And** creates a new user record in the database  
- **And** redirects the user to the Login page  
- **And** the user can log in using the new email/password

**Pass criteria:** Account exists in DB; redirect occurs; login works.

---

### UC01-AT-02 — Email invalid format (Alternative 5a)
**Goal:** Invalid email should be rejected.

- **Given** the user is on the Registration page  
- **When** the user enters an invalid email from E1 and a valid password, then submits  
- **Then** the system rejects the registration  
- **And** displays an error message indicating invalid fields (email)  
- **And** does **not** create an account record  
- **And** keeps the user on the Registration page

**Pass criteria:** No DB record; error shown; stays on form.

---

### UC01-AT-03 — Email already registered (Alternative 5a)
**Goal:** Duplicate email should be rejected.

- **Given** an account already exists with email D1  
- **When** the user enters D1 and a valid password, then submits  
- **Then** the system rejects the registration  
- **And** displays an error message indicating email already exists / invalid fields  
- **And** does **not** create a new account record  
- **And** keeps the user on the Registration page

**Pass criteria:** No additional account created; correct error behavior.

---

### UC01-AT-04 — Password does not meet security requirements (Alternative 5b)
**Goal:** Weak password should be rejected.

- **Given** the user is on the Registration page  
- **When** the user enters a valid new email and a weak password from P1, then submits  
- **Then** the system rejects the registration  
- **And** displays an error message indicating invalid fields (password)  
- **And** does **not** create an account record  
- **And** keeps the user on the Registration page

**Pass criteria:** No DB record; error shown; stays on form.

---

### UC01-AT-05 — Multiple validation failures at once (Email + Password)
**Goal:** System handles multiple invalid inputs gracefully.

- **Given** the user is on the Registration page  
- **When** the user enters an invalid email (E1) and weak password (P1), then submits  
- **Then** the system rejects the registration  
- **And** displays an error message for the invalid fields (at least indicating both fields are invalid)  
- **And** does **not** create an account record  
- **And** keeps the user on the Registration page

**Pass criteria:** No DB record; clear feedback; no crash.

---

### UC01-AT-06 — Required fields missing
**Goal:** Prevent submission with missing required info.

- **Given** the user is on the Registration page  
- **When** the user leaves one or more required fields blank and submits  
- **Then** the system rejects the registration  
- **And** displays an error message indicating required fields are missing/invalid  
- **And** does **not** create an account record

**Pass criteria:** No DB record; error shown.

---

### UC01-AT-07 — Resubmission after correction
**Goal:** Ensure the user can fix errors and successfully register.

- **Given** the user previously submitted invalid data and received an error  
- **When** the user corrects the email/password to valid values and resubmits  
- **Then** the system creates the account  
- **And** redirects to Login  
- **And** user can log in

**Pass criteria:** First attempt fails properly; second attempt succeeds.

---

## Exit Criteria (for UC-01)
UC-01 is considered **accepted** when:
- UC01-AT-01 passes, and
- UC01-AT-02/03/04 pass (all validation alternatives), and
- No test results in partial account creation on failure (data integrity).
