# Use Case UC-06: View Conference Pricing by Attendee Type (REFINED)

## Goal in Context
Allow an attendee to view the conference registration price list so that they understand fees before completing payment.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Attendee (User)

## Secondary Actors
CMS Database

## Trigger
Attendee selects **View Pricing** from the registration interface.

## Success End Condition
The CMS displays correct registration fees for each attendee category, enabling the attendee to proceed to payment (UC-15).

## Failed End Condition
Pricing cannot be displayed due to missing configuration or system error.

## Preconditions
- Conference registration is open.
- Pricing categories are configured in CMS.

## Main Success Scenario
1. Attendee navigates to the **Conference Registration** section.
2. CMS displays a list of attendee categories (e.g., Student, Professional, Author).
3. Attendee selects **View Pricing**.
4. CMS retrieves the fee structure from the database.
5. CMS displays the registration prices clearly for each category.
6. Attendee selects their appropriate category.
7. CMS uses the selected category fee to calculate total cost for payment (UC-15).

## Extensions
- **4a** Pricing configuration missing  
  - **4a1** CMS displays an error and prevents registration until pricing is configured.

- **2a** Attendee selects an invalid category  
  - **2a1** CMS rejects the selection and prompts attendee to choose a valid type.

- **5a** System cannot retrieve pricing due to database error  
  - **5a1** CMS displays an error and advises attendee to retry later.

## Related Information
- Pricing must be available before payment processing (UC-15).
- Different attendee types may have different fees.
