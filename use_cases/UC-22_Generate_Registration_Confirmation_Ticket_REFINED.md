# Use Case UC-16: Generate Registration Confirmation Ticket (REFINED)

## Goal in Context
Allow the system to generate an official confirmation ticket/receipt after successful conference registration payment so that attendees have proof of enrollment.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
System

## Secondary Actors
Attendee, CMS Database, Ticket/Receipt Service

## Trigger
Attendee completes successful payment during conference registration (UC-15).

## Success End Condition
A confirmation ticket with a unique reference number is generated, stored, and made available to the attendee.

## Failed End Condition
Ticket is not generated, and the system informs the attendee while ensuring payment records remain intact.

## Preconditions
- Attendee payment has been approved successfully (UC-15).
- Attendee is marked as Registered.
- Ticket generation service is operational.

## Main Success Scenario
1. Attendee completes credit card payment successfully (UC-15).
2. CMS records the payment transaction in the database.
3. CMS triggers ticket generation for the registered attendee.
4. CMS generates a confirmation ticket containing:
   - Attendee name  
   - Registration category  
   - Payment confirmation number  
   - Unique ticket/reference ID
5. CMS stores the ticket/receipt record in the database.
6. CMS displays the confirmation ticket in the attendee dashboard.
7. CMS optionally emails the ticket to the attendee.
8. CMS logs ticket generation as successful.

## Extensions
- **4a** Ticket service fails during generation  
  - **4a1** CMS informs attendee that payment succeeded but ticket is delayed.  
  - **4a2** CMS schedules ticket retry and keeps registration active.

- **7a** Email delivery fails  
  - **7a1** CMS still stores ticket in dashboard but logs email failure.

- **5a** Database storage error prevents ticket saving  
  - **5a1** CMS displays error and prevents ticket access until resolved.

## Related Information
- Ticket serves as proof of successful conference registration.
- Ticket generation depends on payment completion (UC-15).
