# Use Case UC-06: Reviewer Access Review Form for Assigned Paper (REFINED)

## Goal in Context
Allow a reviewer to access the review form for a paper they have accepted so that they can begin preparing and completing their evaluation.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Reviewer

## Secondary Actors
CMS Database, Editor

## Trigger
Reviewer selects an accepted assigned paper from their dashboard (UC-06) and chooses **Open Review Form**.

## Success End Condition
The CMS displays the review form workspace for the selected paper, enabling the reviewer to begin review completion (UC-06).

## Failed End Condition
The review form cannot be accessed due to missing acceptance, authorization failure, deadline closure, or system error.

## Preconditions
- Reviewer is logged into CMS (UC-03).
- Reviewer has accepted the invitation for the paper (UC-06).
- Paper appears in reviewer’s accepted assignments list (UC-06).
- Review period is open.

## Main Success Scenario
1. Reviewer opens **My Assigned Papers** (UC-06).
2. CMS displays accepted papers available for review.
3. Reviewer selects a specific paper.
4. Reviewer clicks **Open Review Form**.
5. CMS verifies reviewer authorization for that paper assignment.
6. CMS retrieves the review form template and any existing saved progress.
7. CMS displays the review form fields (scores, comments, recommendation).
8. Reviewer begins entering review information.
9. CMS allows reviewer to save progress or proceed to final submission (UC-06).

## Extensions
- **5a** Reviewer has not accepted invitation  
  - **5a1** CMS blocks access and instructs reviewer to accept assignment first (UC-06).

- **5b** Reviewer attempts access to unassigned paper  
  - **5b1** CMS denies access and displays authorization error.

- **6a** Review form unavailable due to system/database error  
  - **6a1** CMS displays system error and requests retry later.

- **4a** Review deadline has passed  
  - **4a1** CMS displays message that review submission is closed and prevents form access.

## Related Information
- Review form submission is completed in UC-06.
- Reviewer must be assigned (UC-06) and accepted (UC-06) before access is granted.
