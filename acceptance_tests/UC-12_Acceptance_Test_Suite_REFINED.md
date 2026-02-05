# Acceptance Test Suite: UC-06 Reviewer Access Review Form for Assigned Paper (REFINED)

## Purpose
Verify that reviewers can access review forms only for accepted assignments, that authorization is enforced, and that review deadlines and system failures are handled safely.

---

## Test Data Sets

### Valid Review Form Access (V1)
- Reviewer accepted invitation and paper listed

### Not Accepted Assignment (A1)
- Invitation pending or declined

### Unauthorized Paper Access (U1)
- Reviewer attempts access to unassigned paper

### Review Deadline Closed (D1)
- Deadline passed for review access

### Retrieval Failure (R1)
- Database/form template unavailable

---

## Acceptance Tests

### UC06-AT-01 — Review form opens for accepted paper
- **Given** reviewer accepted assignment (V1)  
- **When** reviewer selects Open Review Form  
- **Then** CMS displays review form fields and allows progress entry

---

### UC06-AT-02 — Access blocked if invitation not accepted
- **Given** reviewer has not accepted assignment (A1)  
- **When** reviewer attempts to open form  
- **Then** CMS blocks access and instructs acceptance first

---

### UC06-AT-03 — Unauthorized paper access denied
- **Given** reviewer is not assigned to paper (U1)  
- **When** reviewer clicks review form link  
- **Then** CMS denies access and shows authorization error

---

### UC06-AT-04 — Deadline closure prevents form access
- **Given** review deadline has passed (D1)  
- **When** reviewer attempts to open form  
- **Then** CMS prevents access and indicates review period closed

---

### UC06-AT-05 — Retrieval failure handled safely
- **Given** review form retrieval fails (R1)  
- **When** reviewer requests access  
- **Then** CMS shows system error and does not expose incomplete form data

---

## Exit Criteria
UC-06 is accepted when review form access is strictly controlled by assignment acceptance and supports progression into UC-06 submission.
