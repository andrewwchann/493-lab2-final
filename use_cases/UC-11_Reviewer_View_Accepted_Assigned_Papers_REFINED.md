# Use Case UC-06: Reviewer View Accepted Assigned Papers (REFINED)

## Goal in Context
Allow a reviewer to view the list of papers they have accepted to review so that they can access the review workflow and complete evaluations.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Reviewer

## Secondary Actors
CMS Database, Editor, Notification Service

## Trigger
Reviewer logs into CMS and navigates to **My Assigned Papers** after accepting invitations (UC-06).

## Success End Condition
Reviewer sees all papers they have accepted, with access to the review form (UC-06).

## Failed End Condition
Reviewer cannot access assigned papers due to missing acceptance, system error, or no assignments available.

## Preconditions
- Reviewer is logged into CMS (UC-03).
- Reviewer has accepted at least one assignment invitation (UC-06).
- Paper assignments exist in the system (UC-06).

## Main Success Scenario
1. Reviewer logs into CMS and opens the reviewer dashboard.
2. Reviewer selects **My Assigned Papers**.
3. CMS retrieves the list of papers assigned to the reviewer.
4. CMS filters the list to include only assignments the reviewer has accepted.
5. CMS displays each accepted paper with:
   - Paper title and abstract summary  
   - Review deadline  
   - Link to open the review form (UC-06)
6. Reviewer selects a paper from the list.
7. CMS opens the review workspace for that paper, enabling review completion.

## Extensions
- **2a** Reviewer has no accepted assignments  
  - **2a1** CMS displays “No papers currently assigned for review.”

- **4a** Reviewer declined or has not responded to invitation  
  - **4a1** CMS does not display declined/pending papers until accepted.

- **3a** Database retrieval failure  
  - **3a1** CMS displays system error and requests reviewer retry later.

- **6a** Reviewer attempts to access a paper not assigned to them  
  - **6a1** CMS blocks access and displays authorization error.

## Related Information
- Reviewer must accept invitations before papers appear (UC-06).
- Review form submission is handled in UC-06.
- Editor assignment constraints are handled in UC-06.
