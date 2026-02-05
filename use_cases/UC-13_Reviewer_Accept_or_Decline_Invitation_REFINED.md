# Use Case UC-06: Reviewer Accept or Decline Invitation (REFINED)

## Goal in Context
Allow a reviewer to respond to an assignment invitation so that the review process can proceed only when the reviewer explicitly accepts.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Reviewer

## Secondary Actors
Editor, CMS Database, Notification Service

## Trigger
Reviewer opens the reviewer invitation from email or dashboard and selects **Accept** or **Decline**.

## Success End Condition
The reviewer’s response is recorded, the editor is notified, and the paper becomes available for review only if accepted.

## Failed End Condition
The invitation response is not recorded, or the reviewer cannot proceed due to expired or invalid invitation.

## Preconditions
- Editor has assigned the reviewer to a paper (UC-06).
- CMS has sent a reviewer invitation notification.
- Reviewer is logged into CMS.

## Main Success Scenario (Accept Invitation)
1. Reviewer opens the invitation link or assigned-paper notification.
2. CMS displays the paper title, abstract, and review deadline.
3. Reviewer selects **Accept Assignment**.
4. CMS records the acceptance response in the database.
5. CMS updates the reviewer dashboard to include the assigned paper.
6. CMS notifies the editor that the reviewer has accepted.
7. CMS enables the review form submission workflow (UC-06).

## Extensions

- **3a** Reviewer declines the invitation  
  - **3a1** Reviewer selects **Decline Assignment**.  
  - **3a2** CMS records the decline response.  
  - **3a3** CMS notifies the editor that reassignment is required.  
  - **3a4** Paper remains unassigned until another reviewer is chosen.

- **1a** Invitation is expired or invalid  
  - **1a1** CMS displays an error indicating the assignment is no longer active.  
  - **1a2** Reviewer cannot accept or decline.

- **4a** System fails to store response  
  - **4a1** CMS displays an error and asks reviewer to retry later.

## Related Information
- Reviewers must accept before submitting a review (UC-06).
- Declines require editor reassignment to maintain 3-reviewer requirement.
