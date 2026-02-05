# Acceptance Test Suite: UC-16 Make Final Paper Decision (REFINED)

## Purpose
Verify that editors can make final accept/reject decisions only after exactly three completed reviews exist, and that decisions are stored and authors notified.

---

## Test Data Sets

### Valid Decision Case (V1)
- Paper has 3 completed reviews
- Editor selects Accept or Reject

### Incomplete Reviews Case (R1)
- Paper has only 1 or 2 completed reviews

### Cancel Decision Case (C1)
- Editor cancels before confirmation

### Database Failure Case (D1)
- Simulated decision storage failure

---

## Acceptance Tests

### UC16-AT-01 — Successful decision submission
- **Given** paper has 3 completed reviews (V1)  
- **When** editor submits Accept/Reject  
- **Then** CMS stores decision, updates paper status  
- **And** author is notified

---

### UC16-AT-02 — Decision blocked without 3 reviews
- **Given** paper has fewer than 3 reviews (R1)  
- **When** editor attempts decision  
- **Then** CMS blocks submission and informs editor

---

### UC16-AT-03 — Cancel decision does not change status
- **Given** editor selects a decision  
- **When** editor cancels before confirmation (C1)  
- **Then** CMS does not store decision and paper status remains unchanged

---

### UC16-AT-04 — Database failure handled safely
- **Given** editor confirms decision  
- **When** database write fails (D1)  
- **Then** CMS displays error and decision is not recorded

---

## Exit Criteria
UC-16 is accepted when decisions require exactly 3 reviews, are stored correctly, and invalid attempts never proceed.
