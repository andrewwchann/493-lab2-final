# Acceptance Test Suite: UC-06 Update Submitted Paper Manuscript (RE-REFINED)

## Purpose
Verify that manuscript updates enforce the same FR4 constraints as initial submission, preserve metadata integrity, and never overwrite prior versions when failures occur.

---

## Test Data Sets

### Valid Update (V1)
- Replacement file: PDF, 6.8MB
- Metadata complete

### Unsupported Format (F1)
- File: `.exe`

### Boundary Size Cases (S1–S3)
- S1: 6.9MB (allowed)
- S2: 7.0MB (allowed)
- S3: 7.2MB (rejected)

### Missing Metadata (M1)
- Keywords missing

### Upload Failure (U1)
- Storage failure during overwrite

---

## Acceptance Tests

### UC06-AT-01 — Successful manuscript replacement
- **Given** author has an existing submission  
- **When** author uploads V1 and confirms update  
- **Then** CMS overwrites manuscript and confirms success

---

### UC06-AT-02 — Unsupported file format rejected
- **Given** author attempts update  
- **When** author uploads F1  
- **Then** CMS rejects upload with format error

---

### UC06-AT-03 — File size boundary enforced
- **Given** replacement file sizes S1–S3  
- **When** author uploads file  
- **Then** CMS accepts ≤7.0MB and rejects >7.0MB

---

### UC06-AT-04 — Missing metadata blocks update
- **Given** required submission metadata incomplete (M1)  
- **When** author attempts update  
- **Then** CMS blocks update until metadata is corrected

---

### UC06-AT-05 — Upload failure retains previous version
- **Given** author submits valid replacement  
- **When** upload fails (U1)  
- **Then** CMS displays error and preserves prior manuscript

---

## Exit Criteria
UC-06 is accepted when updates match FR4 constraints, enforce boundary rules, preserve metadata, and fail safely without losing prior submissions.
