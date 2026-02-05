# Use Case UC-06: Assign Reviewers to Paper (REFINED)

## Goal in Context
Allow an editor to assign exactly three qualified reviewers to a submitted paper so that the review process can begin.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor

## Secondary Actors
Reviewer, CMS Database, Notification Service

## Trigger
Editor selects **Assign Reviewers** for a submitted paper.

## Success End Condition
Exactly three reviewers are assigned, invitations are sent, and the paper enters the review stage.

## Failed End Condition
Reviewer assignment is blocked and the editor is informed of invalid reviewer emails, workload limits, or incorrect reviewer count.

## Preconditions
- Editor is logged into CMS.
- Paper exists in Submitted state.
- Reviewer accounts exist in CMS.

## Main Success Scenario
1. Editor opens the submitted paper record.
2. CMS displays the reviewer assignment interface.
3. Editor enters reviewer email addresses.
4. CMS validates each reviewer email exists in the system.
5. CMS checks that no reviewer exceeds the workload limit of **5 assigned papers**.
6. Editor assigns exactly **3 reviewers** to the paper.
7. CMS stores reviewer assignments in the database.
8. CMS sends review invitations to the assigned reviewers.
9. CMS confirms successful reviewer assignment.

## Extensions
- **4a** Reviewer email is invalid or not registered  
  - **4a1** CMS displays an error and prevents assignment of that reviewer.

- **5a** Reviewer already has 5 assigned papers  
  - **5a1** CMS blocks assignment and prompts editor to choose another reviewer.

- **6a** Editor assigns fewer or more than 3 reviewers  
  - **6a1** CMS prevents finalization until exactly 3 reviewers are assigned.

## Related Information
- Each paper must have exactly 3 reviewers.
- Reviewers may not be assigned more than 5 papers.
