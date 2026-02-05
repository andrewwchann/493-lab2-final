# Use Case UC-06: Submit Completed Review Form (REFINED)

## Goal in Context
Allow a reviewer to submit a completed review form for an assigned paper so that the editor can evaluate the paper.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Reviewer

## Secondary Actors
CMS Database, Editor

## Trigger
Reviewer selects **Submit Review** for an assigned paper.

## Success End Condition
The completed review form is stored successfully and becomes available to the editor.

## Failed End Condition
The review is rejected and the reviewer is informed of missing required fields or submission errors.

## Preconditions
- Reviewer is logged into CMS.
- Reviewer has an assigned paper in their dashboard.
- Review form is available for the selected paper.

## Main Success Scenario
1. Reviewer opens the assigned paper from their review dashboard.
2. CMS displays the review form with required evaluation fields.
3. Reviewer completes all required fields (ratings, comments, recommendation).
4. Reviewer submits the review form.
5. CMS validates that all required review fields are complete.
6. CMS stores the completed review in the database.
7. CMS confirms successful review submission.
8. CMS makes the review accessible to the editor for decision-making.

## Extensions
- **3a** Reviewer leaves required fields blank  
  - **3a1** CMS highlights missing fields and prevents submission.

- **5a** System cannot store review due to database error  
  - **5a1** CMS displays an error message and asks reviewer to retry later.

- **4a** Reviewer attempts to submit review after deadline (if enforced)  
  - **4a1** CMS blocks submission and informs reviewer that the review period has ended.

## Related Information
- Reviews must be completed before the editor can make a final accept/reject decision (UC-16).
