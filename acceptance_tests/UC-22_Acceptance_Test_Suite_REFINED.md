# Acceptance Test Suite: UC-16 Generate Registration Confirmation Ticket (REFINED)

## Purpose
Verify that confirmation tickets are generated only after successful payment, include required receipt data, and remain accessible even if email delivery fails.

---

## Test Data Sets

### Valid Ticket Generation (V1)
- Payment approved successfully
- Ticket reference ID created

### Ticket Service Failure (T1)
- Payment succeeds but ticket generation fails

### Email Delivery Failure (E1)
- Ticket generated but email cannot be delivered

### Storage Failure (D1)
- Ticket cannot be saved to database

---

## Acceptance Tests

### UC16-AT-01 — Successful ticket generation after payment
- **Given** attendee payment is approved (V1)  
- **When** CMS triggers ticket creation  
- **Then** CMS generates ticket with unique ID and stores it  
- **And** ticket appears in attendee dashboard

---

### UC16-AT-02 — Ticket failure does not invalidate payment
- **Given** payment succeeded  
- **When** ticket service fails (T1)  
- **Then** CMS confirms registration but informs attendee ticket is delayed

---

### UC16-AT-03 — Email failure does not block ticket access
- **Given** ticket is generated successfully  
- **When** email delivery fails (E1)  
- **Then** CMS logs failure but ticket remains accessible in dashboard

---

### UC16-AT-04 — Storage failure prevents ticket retrieval
- **Given** ticket is generated  
- **When** database save fails (D1)  
- **Then** CMS informs attendee and ticket access is delayed until resolved

---

## Exit Criteria
UC-16 is accepted when tickets are generated reliably after payment and failure cases never remove confirmed registration status.
