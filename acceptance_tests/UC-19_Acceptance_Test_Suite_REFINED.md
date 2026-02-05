# Acceptance Test Suite: UC-16 Edit Conference Schedule (REFINED)

## Purpose
Verify that the editor can edit a draft schedule produced by UC-15, that conflicts/invalid times are rejected, and that changes are saved as a draft (not published) until UC-06.

---

## Test Data Sets

### Valid Edit (V1)
- Move Paper #42 from (Room A, 10:00) → (Room B, 11:00)
- No conflicts

### Room/Time Conflict (C1)
- Two papers scheduled in the same room at the same time after edit

### Invalid Timeslot (T1)
- Timeslot outside conference hours (e.g., 23:30)

### Cancel Edit (X1)
- Unsaved changes discarded

### Storage Failure (D1)
- Database write failure on save

---

## Acceptance Tests

### UC16-AT-01 — Successful schedule edit saved as draft
- **Given** a draft schedule exists (UC-15)  
- **When** editor applies V1 and saves  
- **Then** CMS stores the updated draft and refreshes preview  
- **And** schedule is not published publicly

---

### UC16-AT-02 — Conflict prevents saving
- **Given** a draft schedule exists  
- **When** editor makes an edit that creates C1  
- **Then** CMS highlights conflict and blocks save

---

### UC16-AT-03 — Invalid timeslot rejected
- **Given** a draft schedule exists  
- **When** editor selects an invalid time (T1)  
- **Then** CMS rejects change and prompts for valid timeslot

---

### UC16-AT-04 — Cancel discards unsaved edits
- **Given** editor has unsaved changes (X1)  
- **When** editor cancels  
- **Then** CMS restores last saved draft with no new changes applied

---

### UC16-AT-05 — Storage failure does not overwrite last saved draft
- **Given** editor attempts to save a valid edit  
- **When** database write fails (D1)  
- **Then** CMS displays error and retains previous saved draft

---

## Exit Criteria
UC-16 is accepted when schedule edits are validated, conflicts are prevented, drafts are saved reliably, and publication requires UC-06.
