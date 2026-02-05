# Acceptance Test Suite: UC-06 Assign Reviewers to Paper (REFINED)

## Purpose
Verify that editors can assign reviewers only when CMS-SRS constraints are satisfied: valid reviewer emails, max workload 5 papers, and exactly 3 reviewers per paper.

---

## Test Data Sets

### Valid Assignment (V1)
- Reviewers: 3 registered reviewers with <5 current assignments

### Invalid Reviewer Email (E1)
- Reviewer email: `unknown@uni.ca`

### Workload Limit Exceeded (W1)
- Reviewer has already 5 assigned papers

### Incorrect Reviewer Count (C1)
- Assigned reviewers: 2 or 4 reviewers

---

## Acceptance Tests

### UC06-AT-01 — Successful reviewer assignment
- **Given** an editor is logged in and paper is submitted  
- **When** the editor assigns V1 reviewers  
- **Then** CMS stores assignments and sends invitations  
- **And** paper enters review stage

---

### UC06-AT-02 — Invalid reviewer email rejected
- **Given** an editor is assigning reviewers  
- **When** the editor enters E1  
- **Then** CMS displays an error and prevents assignment

---

### UC06-AT-03 — Workload limit enforced
- **Given** reviewer already has 5 papers (W1)  
- **When** editor attempts assignment  
- **Then** CMS blocks assignment and prompts replacement

---

### UC06-AT-04 — Exactly 3 reviewers required
- **Given** editor assigns incorrect reviewer count (C1)  
- **When** editor attempts finalization  
- **Then** CMS prevents submission until exactly 3 reviewers are assigned

---

## Exit Criteria
UC-06 is accepted when reviewer constraints are enforced and only valid assignments proceed.
