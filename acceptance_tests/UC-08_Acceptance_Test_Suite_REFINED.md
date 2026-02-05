# Acceptance Test Suite: UC-06 Validate Paper Submission Fields (REFINED)

## Purpose
Verify that CMS enforces FR4 required submission metadata and manuscript constraints, blocks incomplete/invalid submissions, and provides clear error feedback.

---

## Test Data Sets

### Valid Complete Submission (V1)
- Author info present
- Abstract present
- Keywords present
- Manuscript: PDF, 6.9MB

### Missing Field Sets
- M1: Missing author contact/affiliation
- M2: Missing abstract
- M3: Missing keywords

### Missing Manuscript (F1)
- No file uploaded

### Unsupported Format (F2)
- File: `.png` or `.exe`

### Size Boundary (S1–S3)
- S1: 6.9MB (allowed)
- S2: 7.0MB (allowed)
- S3: 7.3MB (rejected)

### Validation Service Failure (E1)
- Validation module unavailable

---

## Acceptance Tests

### UC06-AT-01 — Valid submission passes validation
- **Given** author provides V1  
- **When** author submits paper  
- **Then** CMS validation succeeds and submission proceeds

---

### UC06-AT-02 — Missing author info blocks submission
- **Given** author missing required author info (M1)  
- **When** author submits  
- **Then** CMS highlights author fields and blocks submission

---

### UC06-AT-03 — Missing abstract blocks submission
- **Given** abstract missing (M2)  
- **When** author submits  
- **Then** CMS highlights abstract field and blocks submission

---

### UC06-AT-04 — Missing keywords blocks submission
- **Given** keywords missing (M3)  
- **When** author submits  
- **Then** CMS highlights keywords field and blocks submission

---

### UC06-AT-05 — Missing manuscript file blocks submission
- **Given** no manuscript uploaded (F1)  
- **When** author submits  
- **Then** CMS displays upload-required error and blocks submission

---

### UC06-AT-06 — Unsupported file format rejected
- **Given** invalid file type uploaded (F2)  
- **When** author submits  
- **Then** CMS rejects upload and prompts PDF/Word/LaTeX

---

### UC06-AT-07 — File size boundary enforced
- **Given** manuscript sizes S1–S3  
- **When** author uploads file  
- **Then** CMS accepts ≤7.0MB and rejects >7.0MB

---

### UC06-AT-08 — Validation outage blocks completion safely
- **Given** validation module unavailable (E1)  
- **When** author submits  
- **Then** CMS shows system error and does not accept submission

---

## Exit Criteria
UC-06 is accepted when all FR4 submission fields/file constraints are enforced consistently and invalid submissions never proceed.
