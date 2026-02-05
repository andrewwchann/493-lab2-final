# Use Case UC-06: Notify Author of Final Decision (REFINED)

## Goal in Context
Allow the system to notify an author of the editor’s final accept/reject decision so that the author receives the official outcome of their submission.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
System

## Secondary Actors
Author, Editor, Notification Service, CMS Database

## Trigger
Editor submits a final decision for a paper (UC-16).

## Success End Condition
The author receives an acceptance or rejection notification, and the paper status is updated in the author dashboard.

## Failed End Condition
The notification is not delivered, and the system records the failure and alerts the editor/administrator.

## Preconditions
- A final decision has been recorded successfully (UC-16).
- Author account exists with a valid email address.
- Notification service is operational.

## Main Success Scenario
1. Editor completes a final decision for a paper (Accept or Reject).
2. CMS retrieves the author’s contact information.
3. CMS generates the official decision message based on outcome.
4. CMS sends the decision notification to the author via email and dashboard alert.
5. CMS updates the paper status in the author’s submission list.
6. CMS logs that the notification was delivered successfully.

## Extensions

- **3a** Author email address is missing or invalid  
  - **3a1** CMS cannot send email and logs an error.  
  - **3a2** CMS still posts the decision in the author dashboard.

- **4a** Notification service fails to deliver message  
  - **4a1** CMS records delivery failure and retries later.  
  - **4a2** CMS alerts editor/admin of undelivered notification.

- **2a** Decision record cannot be retrieved  
  - **2a1** CMS displays an internal error and prevents notification.

## Related Information
- Authors must be informed of acceptance/rejection after editor decision (UC-16).
- Notification ensures transparency and closure of the review process.
