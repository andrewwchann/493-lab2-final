# Acceptance Test Suite: UC-03 Log In to CMS (REFINED)

## Purpose
Verify that only registered users can log in with valid credentials, that errors are handled correctly, and that authenticated sessions are created upon success.

---

## Test Data Sets

### Valid Login (V1)
- Registered email + correct password

### Unregistered Email (E1)
- Email not in system database

### Incorrect Password (P1)
- Registered email + wrong password

### Empty Fields (F1)
- Missing email or password

### Auth Service Failure (S1)
- Authentication backend unavailable

---

## Acceptance Tests

### UC03-AT-01 — Successful login creates session
- **Given** user has a registered account (V1)  
- **When** user submits valid credentials  
- **Then** CMS authenticates user and creates session  
- **And** redirects user to dashboard

---

### UC03-AT-02 — Unregistered email rejected
- **Given** email is not registered (E1)  
- **When** user attempts login  
- **Then** CMS displays “Account not found” and blocks login

---

### UC03-AT-03 — Incorrect password rejected
- **Given** email exists but password is wrong (P1)  
- **When** user submits login  
- **Then** CMS displays “Invalid password” and allows retry

---

### UC03-AT-04 — Missing required fields blocked
- **Given** login form has empty required fields (F1)  
- **When** user submits form  
- **Then** CMS highlights missing fields and prevents submission

---

### UC03-AT-05 — Auth service failure handled safely
- **Given** authentication backend is unavailable (S1)  
- **When** user submits credentials  
- **Then** CMS shows system error and does not create session

---

## Exit Criteria
UC-03 is accepted when login works only with valid registered credentials and all failure conditions prevent unauthorized access.
