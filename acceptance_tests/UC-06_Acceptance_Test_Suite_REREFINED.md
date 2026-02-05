# Acceptance Test Suite: UC-06 Submit Paper Manuscript (RE-REFINED)

## Purpose
Verify that paper submissions require all SRS-defined metadata fields, enforce manuscript format and 7MB size constraints, and support saving progress at any step.

---

## Test Data Sets

### Valid Submission (V1)
- All required metadata present
- File: PDF, 6.9MB

### Missing Metadata (M1)
- Abstract missing

### Unsupported Format (F1)
- File: `.exe`

### Boundary Size Cases (S1–S3)
- S1: 6.9MB (allowed)
- S2: 7.0MB (allowed)
- S3: 7.1MB (rejected)

### Save Draft Case (D1)
- Partial metadata entered, Save clicked

### Upload Failure (U1)
- Storage failure during submission

---

## Acceptance Tests

### UC06-AT-01 — Successful submission accepted
- **Given** author provides V1  
- **When** author submits paper  
- **Then** CMS stores manuscript + metadata and marks paper Submitted

---

### UC06-AT-02 — Missing metadata blocks submission
- **Given** submission missing required field (M1)  
- **When** author attempts submit  
- **Then** CMS highlights missing fields and rejects submission

---

### UC06-AT-03 — Unsupported file format rejected
- **Given** author uploads invalid format (F1)  
- **When** author submits  
- **Then** CMS rejects upload and prompts supported formats

---

### UC06-AT-04 — File size boundary enforced
- **Given** manuscript sizes S1–S3  
- **When** author uploads file  
- **Then** CMS accepts ≤7.0MB and rejects >7.0MB

---

### UC06-AT-05 — Save progress creates draft
- **Given** author enters partial data (D1)  
- **When** author clicks Save  
- **Then** CMS stores Draft submission without entering review

---

### UC06-AT-06 — Upload/storage failure prevents completion
- **Given** valid submission attempt  
- **When** upload fails (U1)  
- **Then** CMS displays error and does not mark paper Submitted

---

## Exit Criteria
UC-06 is accepted when submissions meet all FR4 field/file constraints, enforce 7MB boundary rules, and support save-at-any-step draft behavior (FR5).
