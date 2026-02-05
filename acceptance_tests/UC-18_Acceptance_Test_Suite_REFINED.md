# Acceptance Test Suite: UC-15 Generate Conference Schedule (REFINED)

## Purpose
Verify that the CMS generates an HTML conference schedule only when accepted papers exist, stores it correctly, and supports publication with editor oversight.

---

## Test Data Sets

### Valid Schedule Generation (V1)
- Multiple accepted papers exist
- Algorithm produces session assignments

### No Accepted Papers (N1)
- Accepted paper list is empty

### Algorithm Failure Case (A1)
- Scheduling engine throws an error

### Manual Edit Required (E1)
- Editor adjusts schedule before publishing

### Storage Failure Case (D1)
- Database write failure when saving schedule

---

## Acceptance Tests

### UC15-AT-01 — Successful schedule generation and publication
- **Given** accepted papers exist (V1)  
- **When** editor generates schedule  
- **Then** CMS produces HTML program, stores it, and publishes successfully

---

### UC15-AT-02 — Schedule blocked with no accepted papers
- **Given** no accepted papers exist (N1)  
- **When** editor selects Generate Schedule  
- **Then** CMS blocks generation and informs editor

---

### UC15-AT-03 — Algorithm failure prevents schedule creation
- **Given** scheduling engine fails (A1)  
- **When** editor generates schedule  
- **Then** CMS displays error and does not publish schedule

---

### UC15-AT-04 — Editor can edit schedule before publishing
- **Given** schedule is generated successfully  
- **When** editor requests edits (E1)  
- **Then** CMS allows adjustments before final publication

---

### UC15-AT-05 — Storage failure blocks publication
- **Given** schedule is generated  
- **When** database storage fails (D1)  
- **Then** CMS prevents saving/publishing and informs editor

---

## Exit Criteria
UC-15 is accepted when schedule generation produces valid HTML output, is publishable only when stored, and respects editor control.
