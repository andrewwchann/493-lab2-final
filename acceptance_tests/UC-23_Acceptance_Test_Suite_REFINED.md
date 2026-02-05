# Acceptance Test Suite: UC-06 View Conference Pricing by Attendee Type (REFINED)

## Purpose
Verify that attendees can view accurate pricing by category before payment, and that pricing failures block registration payment correctly.

---

## Test Data Sets

### Valid Pricing Table (V1)
- Categories configured with correct fees

### Missing Pricing Configuration (M1)
- No pricing table exists

### Invalid Category Selection (C1)
- Attendee selects non-existent category

### Database Failure (D1)
- Pricing retrieval fails

---

## Acceptance Tests

### UC06-AT-01 — Pricing displayed successfully
- **Given** pricing categories exist (V1)  
- **When** attendee selects View Pricing  
- **Then** CMS displays correct fees for each category  
- **And** attendee can proceed to UC-15 payment

---

### UC06-AT-02 — Missing pricing blocks registration
- **Given** pricing configuration missing (M1)  
- **When** attendee attempts to view pricing  
- **Then** CMS displays error and prevents payment workflow

---

### UC06-AT-03 — Invalid category rejected
- **Given** attendee selects invalid category (C1)  
- **When** category is submitted  
- **Then** CMS rejects selection and prompts valid options

---

### UC06-AT-04 — Database failure prevents pricing display
- **Given** database retrieval fails (D1)  
- **When** attendee requests pricing  
- **Then** CMS displays error and advises retry later

---

## Exit Criteria
UC-06 is accepted when pricing is accurate, category-based, and required before payment registration can proceed.
