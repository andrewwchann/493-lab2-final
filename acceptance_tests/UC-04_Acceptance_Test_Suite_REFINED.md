# Acceptance Test Suite: UC-04 Change Account Password (REFINED)

## Purpose
Verify that authenticated users can change passwords securely, that UC-02 validation rules are enforced, and that incorrect current credentials prevent updates.

---

## Test Data Sets

### Valid Password Change (V1)
- Correct current password
- New password satisfies UC-02 rules

### Incorrect Current Password (C1)
- Current password mismatch

### Confirmation Mismatch (M1)
- New password and confirm password differ

### Invalid New Password (P1)
- New password fails validation rules

### Database Failure (D1)
- Credential update cannot be stored

---

## Acceptance Tests

### UC04-AT-01 — Successful password change
- **Given** user is logged in and provides valid V1  
- **When** user submits Change Password  
- **Then** CMS updates password and confirms success  
- **And** future logins require the new password

---

### UC04-AT-02 — Incorrect current password blocks change
- **Given** user enters wrong current password (C1)  
- **When** user submits request  
- **Then** CMS rejects change and displays error

---

### UC04-AT-03 — Confirmation mismatch prevented
- **Given** new password confirmation mismatch (M1)  
- **When** user submits form  
- **Then** CMS blocks submission and highlights mismatch

---

### UC04-AT-04 — New password validation enforced
- **Given** new password fails UC-02 rules (P1)  
- **When** user submits request  
- **Then** CMS rejects password and prompts correction

---

### UC04-AT-05 — Database failure handled safely
- **Given** valid password change attempt  
- **When** database update fails (D1)  
- **Then** CMS displays system error and password remains unchanged

---

## Exit Criteria
UC-04 is accepted when password changes require correct current credentials, enforce validation rules, and fail safely without compromising account security.
