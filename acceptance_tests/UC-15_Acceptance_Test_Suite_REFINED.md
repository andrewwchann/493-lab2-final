# Acceptance Test Suite: UC-15 Editor Receive Completed Review Forms (REFINED)

## Purpose
Verify that the editor receives access to a complete set of review forms only when the required number of reviews are submitted, and that readiness status/notifications are handled safely.

---

## Test Data Sets

### Reviews Complete (V1)
- Exactly 3 submitted reviews exist for a paper

### Partial Reviews (P1)
- Only 1–2 submitted reviews exist

### Notification Failure (N1)
- Reviews complete but notification delivery fails

### Corrupted/Missing Review Data (C1)
- Reviews complete but one review record is unreadable/missing

### Retrieval Failure (D1)
- Database failure when editor opens paper

---

## Acceptance Tests

### UC15-AT-01 — Reviews complete triggers readiness state and editor access
- **Given** three reviews are submitted for the paper (V1)  
- **When** the third review is submitted  
- **Then** CMS marks paper as Reviews Complete, stores/locks review set, and makes all reviews accessible to editor  
- **And** editor can proceed to UC-16

---

### UC15-AT-02 — Fewer than required reviews does not trigger readiness
- **Given** fewer than three reviews exist (P1)  
- **When** a reviewer submits (bringing total to 1 or 2)  
- **Then** CMS keeps paper Under Review and does not notify editor of completion

---

### UC15-AT-03 — Notification failure does not block readiness
- **Given** reviews are complete (V1)  
- **When** notification delivery fails (N1)  
- **Then** CMS still updates readiness status and logs failure for retry

---

### UC15-AT-04 — Corrupted/missing review data prevents full display
- **Given** reviews are complete but one is corrupted/missing (C1)  
- **When** editor opens the paper  
- **Then** CMS shows an error and does not present an incomplete/misleading review set  
- **And** logs issue for investigation

---

### UC15-AT-05 — Retrieval failure handled safely
- **Given** reviews are complete  
- **When** database retrieval fails (D1)  
- **Then** CMS shows system error and asks editor to retry later

---

## Exit Criteria
UC-15 is accepted when the editor can access all required review forms only after completion, and failure cases never produce incorrect readiness or partial/unsafe displays.
