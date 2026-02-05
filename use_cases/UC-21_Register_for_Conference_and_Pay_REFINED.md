# Use Case UC-15: Register for Conference and Pay (REFINED)

## Goal in Context
Allow an attendee to register for the conference and complete payment by credit card so that attendance is confirmed.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Attendee (Authorized User)

## Secondary Actors
Payment Gateway, CMS Database, Ticket Confirmation Service

## Trigger
Attendee selects **Conference Registration** from the CMS interface.

## Success End Condition
Payment is successfully processed, registration is confirmed, and the attendee receives a ticket/confirmation.

## Failed End Condition
Registration is not completed because payment fails, details are invalid, or confirmation cannot be generated.

## Preconditions
- Attendee is logged into CMS.
- Conference registration is open.
- Price list is available for attendee categories (UC-06).

## Main Success Scenario
1. Attendee navigates to the **Conference Registration** page.
2. CMS displays available attendee categories and pricing.
3. Attendee selects the appropriate registration type.
4. CMS calculates the total fee and displays payment form.
5. Attendee enters valid credit card payment information.
6. Attendee submits the payment request.
7. CMS sends payment details securely to the payment gateway.
8. Payment gateway approves the transaction.
9. CMS stores the payment record and marks the attendee as registered.
10. CMS generates a confirmation ticket/receipt.
11. CMS displays payment confirmation to the attendee.

## Extensions
- **5a** Payment details are incomplete or invalid  
  - **5a1** CMS highlights invalid fields and prevents submission.

- **8a** Payment is declined by the gateway  
  - **8a1** CMS displays a declined-payment message and does not confirm registration.

- **10a** Ticket generation fails  
  - **10a1** CMS stores payment but informs attendee that ticket will be available later.

## Related Information
- Payment must be completed by credit card.
- Confirmation ticket serves as proof of registration (UC-16).
