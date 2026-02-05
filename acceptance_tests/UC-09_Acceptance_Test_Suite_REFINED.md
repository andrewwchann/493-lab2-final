# Acceptance Test Suite: UC-06 Save Submission Progress (REFINED)

## Purpose
Verify that authors can save and resume draft submissions, and that drafts do not enter the review process until final submission.

---

## Test Data Sets

### Valid Draft Save (V1)
- Title provided
- Some metadata entered
- Manuscript may be missing

### Missing Draft Minimums (M1)
- No title/identifier provided
- Save Draft attempted

### Database Failure (D1)
- Simulated database write failure during draft save

### Deadline Passed (L1)
- Draft exists but submission deadline has passed

---

## Acceptance Tests

### UC06-AT-01 — Successful draft save
- **Given** author is editing a new submission  
- **When** author selects Save Draft with V1  
- **Then** CMS stores a Draft record and confirms save  
- **And** the draft does not enter review workflow

---

### UC06-AT-02 — Resume draft restores saved state
- **Given** author previously saved a draft successfully  
- **When** author reopens the draft from My Submissions  
- **Then** CMS loads previously entered fields for continued editing

---

### UC06-AT-03 — Draft not saved without minimum information
- **Given** author has not entered minimum draft information (M1)  
- **When** author selects Save Draft  
- **Then** CMS displays an error and does not create a draft

---

### UC06-AT-04 — Database failure does not create/alter draft
- **Given** author attempts to save a draft  
- **When** database write fails (D1)  
- **Then** CMS displays an error and no draft is saved

---

### UC06-AT-05 — Deadline blocks final submission from draft
- **Given** a draft exists and deadline has passed (L1)  
- **When** author attempts to proceed to final submission  
- **Then** CMS blocks submission and informs author the window is closed

---

## Exit Criteria
UC-06 is accepted when drafts can be saved/resumed reliably, and drafts never enter review until UC-06 completes successfully.
