# Acceptance Test Suite: UC-15 Register for Conference and Pay (REFINED)

## Purpose
Verify that attendees can register only when credit card payment succeeds, pricing is applied correctly, and confirmation tickets are generated.

---

## Test Data Sets

### Valid Payment Case (V1)
- Attendee selects category with valid price
- Payment gateway approves transaction

### Invalid Payment Details (P1)
- Missing credit card number or expiry

### Payment Declined Case (D1)
- Gateway rejects transaction

### Ticket Generation Failure (T1)
- Payment succeeds but ticket service fails

---

## Acceptance Tests

### UC15-AT-01 — Successful registration and payment
- **Given** attendee is logged in and registration is open  
- **When** attendee completes payment successfully (V1)  
- **Then** CMS confirms registration, stores payment, and generates ticket

---

### UC15-AT-02 — Invalid payment details rejected
- **Given** attendee enters incomplete payment info (P1)  
- **When** attendee submits payment  
- **Then** CMS highlights errors and prevents processing

---

### UC15-AT-03 — Declined payment does not confirm registration
- **Given** gateway declines payment (D1)  
- **When** attendee submits transaction  
- **Then** CMS displays decline message and registration remains incomplete

---

### UC15-AT-04 — Ticket failure handled safely
- **Given** payment succeeds  
- **When** ticket generation fails (T1)  
- **Then** CMS stores payment but informs attendee ticket will be available later

---

## Exit Criteria
UC-15 is accepted when only approved payments confirm registration and failures never grant attendance access.
