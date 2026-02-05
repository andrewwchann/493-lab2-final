# Use Case UC-15: Editor Receive Completed Review Forms (REFINED)

## Goal in Context
Allow the editor to receive and access the completed review forms for a paper so that they can proceed to the final decision process.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor

## Secondary Actors
Reviewer, CMS Database, Notification Service

## Trigger
The third required reviewer submits their completed review form for a paper (UC-06), causing the CMS to make the full review set available to the editor.

## Success End Condition
All required review forms are stored and made accessible to the editor, and the editor is notified that the paper is ready for decision (UC-16).

## Failed End Condition
The editor cannot access the complete set of reviews due to missing reviews, data retrieval errors, or system/notification failure.

## Preconditions
- Paper has been submitted (UC-06) and assigned to reviewers (UC-06).
- Reviewers have accepted invitations (UC-06) and can access the review form (UC-06).
- At least one review has been submitted (UC-06).
- Editor is logged into CMS.

## Main Success Scenario
1. CMS detects that the third required review form for a paper has been submitted (UC-06).
2. CMS verifies that the required number of completed reviews for the paper is satisfied.
3. CMS stores/locks the completed review set for editor access.
4. CMS updates the paper status to **Reviews Complete** (or equivalent readiness state).
5. CMS notifies the editor that the paper is ready for decision.
6. Editor opens the paper in the editor dashboard.
7. CMS displays all completed review forms for that paper.
8. Editor confirms that the reviews are available and proceeds to make the final decision (UC-16).

## Extensions
- **2a** Fewer than the required number of reviews are submitted  
  - **2a1** CMS keeps the paper status as **Under Review**.  
  - **2a2** CMS does not notify the editor that reviews are complete.

- **7a** One or more review forms are missing/corrupted  
  - **7a1** CMS displays an error indicating reviews cannot be fully displayed.  
  - **7a2** CMS logs the issue and alerts administrator/editor to investigate.

- **5a** Notification delivery fails  
  - **5a1** CMS still updates readiness status.  
  - **5a2** CMS logs notification failure and retries later.

- **6a** Database retrieval failure when editor opens paper  
  - **6a1** CMS displays a system error and advises retry later.

## Related Information
- Review submission is handled by UC-06.
- Editor uses the completed reviews to make the final decision in UC-16.
