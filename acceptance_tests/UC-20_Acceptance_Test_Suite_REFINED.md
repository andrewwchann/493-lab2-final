# Acceptance Test Suite: UC-06 Publish Final Conference Schedule Announcement (REFINED)

## Purpose
Verify that the editor can publish a finalized schedule only after draft generation/editing, that publication makes it publicly accessible, and that failures do not incorrectly finalize schedules.

---

## Test Data Sets

### Valid Publication Case (V1)
- Draft schedule exists and editor confirms publish

### Cancel Publication Case (C1)
- Editor cancels at confirmation step

### Website Publication Failure (W1)
- Public website upload fails

### Database Finalization Failure (D1)
- Cannot mark schedule as Final

### Notification Failure (N1)
- Announcement email delivery fails

---

## Acceptance Tests

### UC06-AT-01 — Successful schedule publication
- **Given** a finalized draft schedule exists (V1)  
- **When** editor confirms Publish Schedule  
- **Then** CMS marks schedule Final and publishes HTML to public website  
- **And** schedule becomes publicly accessible

---

### UC06-AT-02 — Cancel prevents publication
- **Given** editor initiates publishing  
- **When** editor cancels confirmation (C1)  
- **Then** CMS does not publish and schedule remains draft

---

### UC06-AT-03 — Website failure prevents publication
- **Given** editor confirms publish  
- **When** publication fails (W1)  
- **Then** CMS displays error and keeps schedule in draft state

---

### UC06-AT-04 — Database failure blocks finalization
- **Given** schedule is ready  
- **When** database cannot mark Final (D1)  
- **Then** CMS blocks publishing and informs editor

---

### UC06-AT-05 — Notification failure does not block publication
- **Given** schedule publishes successfully  
- **When** notification fails (N1)  
- **Then** CMS logs failure and retries, but schedule remains public

---

## Exit Criteria
UC-06 is accepted when publication requires editor confirmation, produces public visibility, and failure cases never publish incomplete schedules.
