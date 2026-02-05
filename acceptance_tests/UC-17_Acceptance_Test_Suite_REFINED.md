# Acceptance Test Suite: UC-06 Notify Author of Final Decision (REFINED)

## Purpose
Verify that authors are notified only after a final decision is stored, and that decision outcomes are correctly delivered via email/dashboard with proper failure handling.

---

## Test Data Sets

### Valid Notification Case (V1)
- Decision recorded successfully (Accept/Reject)
- Author email valid

### Missing Email Case (M1)
- Author email missing or invalid

### Delivery Failure Case (D1)
- Notification service rejects delivery

### Decision Retrieval Failure (R1)
- Decision record unavailable

---

## Acceptance Tests

### UC06-AT-01 — Successful author notification
- **Given** editor decision is recorded (V1)  
- **When** CMS triggers notification  
- **Then** author receives decision via email/dashboard  
- **And** paper status updates correctly

---

### UC06-AT-02 — Missing email still updates dashboard
- **Given** author email is invalid (M1)  
- **When** CMS attempts notification  
- **Then** CMS logs failure but posts decision in dashboard

---

### UC06-AT-03 — Delivery failure triggers retry and alert
- **Given** notification delivery fails (D1)  
- **When** CMS sends decision email  
- **Then** CMS records failure, retries later, and alerts editor/admin

---

### UC06-AT-04 — Decision retrieval failure prevents notification
- **Given** decision record cannot be retrieved (R1)  
- **When** CMS triggers notification  
- **Then** CMS halts notification and logs internal error

---

## Exit Criteria
UC-06 is accepted when notifications are accurate, decision-dependent, and robust against delivery failures.
