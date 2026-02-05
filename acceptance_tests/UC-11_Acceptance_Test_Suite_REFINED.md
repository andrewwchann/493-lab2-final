# Acceptance Test Suite: UC-06 Reviewer View Accepted Assigned Papers (REFINED)

## Purpose
Verify that reviewers can view only papers they have accepted, that declined/pending assignments are hidden, and that review access is properly authorized.

---

## Test Data Sets

### Valid Accepted Assignment (V1)
- Reviewer accepted invitation (UC-06)
- Paper appears in list

### No Accepted Papers (N1)
- Reviewer has no accepted assignments

### Pending/Declined Assignment (P1)
- Invitation not accepted or declined

### Database Failure (D1)
- Assignment retrieval fails

### Unauthorized Access (U1)
- Reviewer attempts to access unassigned paper

---

## Acceptance Tests

### UC06-AT-01 — Accepted papers displayed successfully
- **Given** reviewer accepted an assignment (V1)  
- **When** reviewer opens My Assigned Papers  
- **Then** CMS displays the paper with review access link

---

### UC06-AT-02 — No accepted assignments shows empty state
- **Given** reviewer has no accepted papers (N1)  
- **When** reviewer opens dashboard list  
- **Then** CMS displays “No papers currently assigned for review”

---

### UC06-AT-03 — Pending/declined invitations hidden
- **Given** reviewer has pending or declined invitation (P1)  
- **When** reviewer views assigned papers  
- **Then** CMS does not display those papers until accepted

---

### UC06-AT-04 — Database failure handled safely
- **Given** assignment retrieval fails (D1)  
- **When** reviewer requests list  
- **Then** CMS displays system error and does not expose partial data

---

### UC06-AT-05 — Unauthorized paper access blocked
- **Given** reviewer attempts access to unassigned paper (U1)  
- **When** reviewer clicks unauthorized link  
- **Then** CMS blocks access and displays authorization error

---

## Exit Criteria
UC-06 is accepted when reviewers see only accepted assignments and can proceed safely into UC-06 review submission.
