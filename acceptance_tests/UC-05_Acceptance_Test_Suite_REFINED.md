# Acceptance Test Suite: UC-05 Handle Login Failure and Display Error Message (REFINED)

## Purpose
Verify that invalid login attempts are denied, appropriate error messages are displayed, and no authenticated session is created.

---

## Test Data Sets

### Wrong Password (P1)
- Registered email/username + incorrect password

### Unknown Account (A1)
- Unregistered email/username

### Missing Fields (F1)
- Empty email/username or password

### Auth/DB Failure (S1)
- Authentication service/database unavailable

---

## Acceptance Tests

### UC05-AT-01 — Incorrect password denied with message
- **Given** user account exists  
- **When** user submits wrong password (P1)  
- **Then** CMS denies login, creates no session, and shows “Invalid password”

---

### UC05-AT-02 — Unknown account denied with message
- **Given** email/username is not registered (A1)  
- **When** user submits login  
- **Then** CMS denies login and shows “Account not found”

---

### UC05-AT-03 — Missing fields blocked client-side/server-side
- **Given** required fields are missing (F1)  
- **When** user submits login form  
- **Then** CMS highlights missing inputs and prevents submission

---

### UC05-AT-04 — Auth service failure handled safely
- **Given** authentication service/database is unavailable (S1)  
- **When** user attempts login  
- **Then** CMS shows system error and does not create a session

---

## Exit Criteria
UC-05 is accepted when invalid credentials never grant access and users receive clear error feedback for retry.
