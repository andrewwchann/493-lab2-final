# Acceptance Test Suite: UC-06 Submit Completed Review Form (REFINED)

## Purpose
Verify that reviewers can submit review forms only when all required CMS-SRS constraints are satisfied and that completed reviews are stored for editor access.

---

## Test Data Sets

### Valid Review Submission (V1)
- All required fields completed
- Recommendation provided

### Missing Required Field (M1)
- Recommendation field left blank

### Database Failure Case (D1)
- Simulated database write failure

### Deadline Passed Case (L1)
- Review submission attempted after deadline

---

## Acceptance Tests

### UC06-AT-01 — Successful review submission
- **Given** reviewer has an assigned paper  
- **When** reviewer submits V1  
- **Then** CMS stores the review and confirms submission  
- **And** review becomes available to the editor

---

### UC06-AT-02 — Missing required fields rejected
- **Given** reviewer is completing review form  
- **When** reviewer submits M1  
- **Then** CMS highlights missing fields and prevents submission

---

### UC06-AT-03 — Database failure handled safely
- **Given** reviewer submits a complete review  
- **When** database storage fails (D1)  
- **Then** CMS displays an error and does not mark review as submitted

---

### UC06-AT-04 — Submission blocked after deadline
- **Given** review period has ended  
- **When** reviewer attempts submission (L1)  
- **Then** CMS blocks submission and informs reviewer

---

## Exit Criteria
UC-06 is accepted when valid reviews are stored correctly and invalid or late reviews cannot proceed.
