# Use Case UC-16: Make Final Paper Decision (REFINED)

## Goal in Context
Allow the editor to make a final accept/reject decision for a paper once all required reviews are completed.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor

## Secondary Actors
CMS Database, Author Notification Service

## Trigger
Editor selects **Make Decision** for a reviewed paper.

## Success End Condition
The editor’s decision is stored, and the author is notified of acceptance or rejection.

## Failed End Condition
The decision is blocked because fewer than three reviews are complete or a system error occurs.

## Preconditions
- Editor is logged into CMS.
- The paper has exactly **3 completed reviews** available.
- All reviews have been submitted successfully (UC-06).

## Main Success Scenario
1. Editor opens the paper review summary page.
2. CMS displays all three completed review forms.
3. Editor evaluates reviewer feedback and recommendations.
4. Editor selects a final decision: **Accept** or **Reject**.
5. Editor confirms the decision submission.
6. CMS validates that exactly three reviews are completed.
7. CMS records the decision in the database.
8. CMS notifies the author of the final decision.
9. CMS marks the paper status as Accepted or Rejected.

## Extensions
- **2a** Fewer than three reviews are completed  
  - **2a1** CMS blocks decision making and informs editor that 3 reviews are required.

- **5a** Editor cancels decision before confirmation  
  - **5a1** CMS returns to the review summary page without saving changes.

- **7a** System fails to store decision due to database error  
  - **7a1** CMS displays an error and requests the editor retry later.

## Related Information
- Authors must receive notification of the editor’s final decision (UC-06).
- Decision cannot be made until all 3 reviews are submitted.
