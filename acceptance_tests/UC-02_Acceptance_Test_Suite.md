# Acceptance Test Suite: UC-02 Validate Registration Credentials

## Purpose
Verify that the Conference Management System (CMS) correctly validates registration credentials (email and password), allowing registration to proceed only when both are valid.

---

## Test Data Sets

### Valid credentials (V1)
- Email: `newuser002@example.com` *(not registered)*
- Password: `ValidPass123!`

### Invalid email formats (E1)
- `bademail`
- `bad@email`
- `@example.com`
- `user@.com`

### Duplicate email (D1)
- Email: `existing@example.com` *(already registered in CMS)*

### Weak passwords (P1) *(examples; rule may vary)*
- `short`
- `password`
- `12345678`
- `NoSpecialChar1`

---

## Acceptance Tests

### UC02-AT-01 — Valid email and valid password (Happy Path)
**Goal:** Accept valid credentials and allow registration to continue.

- **Given** the user is on the registration form  
- **When** the user submits V1 credentials  
- **Then** the system validates the email format  
- **And** confirms the email is unique  
- **And** validates the password against security requirements  
- **And** returns a successful validation result

**Pass criteria:** Validation succeeds and the registration workflow proceeds.

---

### UC02-AT-02 — Invalid email format (Alternative 2a)
**Goal:** Reject an invalid email format.

- **Given** the user is on the registration form  
- **When** the user submits an email from E1 with a valid password  
- **Then** the system rejects the credentials  
- **And** displays an error message indicating invalid fields (email)  
- **And** registration does not proceed

**Pass criteria:** Validation fails and the user is informed of the error.

---

### UC02-AT-03 — Duplicate email address (Alternative 3a)
**Goal:** Reject an email address that is already registered.

- **Given** an account already exists with email D1  
- **When** the user submits D1 with a valid password  
- **Then** the system rejects the credentials  
- **And** displays an error message indicating the email is already registered  
- **And** registration does not proceed

**Pass criteria:** Validation fails and no further registration steps occur.

---

### UC02-AT-04 — Weak password (Alternative 4a)
**Goal:** Reject a password that does not meet security requirements.

- **Given** the user enters a valid, unregistered email  
- **When** the user submits a weak password from P1  
- **Then** the system rejects the credentials  
- **And** displays an error message indicating invalid fields (password)  
- **And** registration does not proceed

**Pass criteria:** Validation fails and the user is prompted to correct the password.

---

### UC02-AT-05 — Multiple invalid fields (email and password)
**Goal:** Handle multiple validation failures correctly.

- **Given** the user is on the registration form  
- **When** the user submits an invalid email (E1) and a weak password (P1)  
- **Then** the system rejects the credentials  
- **And** displays an error message indicating invalid fields  
- **And** registration does not proceed

**Pass criteria:** Validation fails with clear feedback.

---

### UC02-AT-06 — Borderline but valid email format
**Goal:** Ensure commonly accepted email formats are handled correctly.

- **Given** the user is on the registration form  
- **When** the user submits `user.name+tag@example.com` with a valid password  
- **Then** the system accepts the email format  
- **And** continues validation normally

**Pass criteria:** Validation succeeds if uniqueness and password checks pass.

---

### UC02-AT-07 — Leading and trailing whitespace handling
**Goal:** Ensure consistent handling of whitespace in credentials.

- **Given** the user is on the registration form  
- **When** the user submits credentials with leading/trailing whitespace  
- **Then** the system either trims whitespace before validation or rejects the input consistently  
- **And** registration does not proceed unless validation succeeds

**Pass criteria:** Behavior is consistent and clearly defined.

---

## Exit Criteria (for UC-02)
UC-02 is considered **accepted** when:
- UC02-AT-01 passes, and
- UC02-AT-02, UC02-AT-03, and UC02-AT-04 all pass, and
- No invalid credentials allow the registration workflow to proceed.
