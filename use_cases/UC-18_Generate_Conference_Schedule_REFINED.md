# Use Case UC-15: Generate Conference Schedule (REFINED)

## Goal in Context
Allow the system to generate a complete conference presentation schedule so that accepted papers can be organized into sessions and published.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor (Conference Organizer)

## Secondary Actors
Scheduling Algorithm Engine, CMS Database, Public Website Module

## Trigger
Editor selects **Generate Schedule** after paper decisions are finalized.

## Success End Condition
The CMS produces an HTML conference schedule program that the editor can review and publish.

## Failed End Condition
The schedule is not generated due to missing accepted papers, algorithm failure, or storage error.

## Preconditions
- Papers have been accepted/rejected (UC-16).
- Accepted papers are available for scheduling.
- Editor is logged into CMS.

## Main Success Scenario
1. Editor navigates to the **Scheduling** module.
2. CMS displays the list of accepted papers eligible for scheduling.
3. Editor selects **Generate Schedule**.
4. CMS invokes the scheduling algorithm to assign papers into sessions, rooms, and timeslots.
5. CMS produces a draft schedule in **HTML program format**.
6. CMS stores the generated schedule in the database.
7. CMS displays the schedule preview for editor review.
8. Editor confirms the schedule is ready for publication.
9. CMS publishes the final schedule to the conference public website.

## Extensions

- **2a** No accepted papers exist  
  - **2a1** CMS blocks schedule generation and informs editor that scheduling cannot proceed.

- **4a** Scheduling algorithm fails  
  - **4a1** CMS displays an error and logs the failure for administrator review.

- **8a** Editor wants to manually edit schedule before publishing  
  - **8a1** CMS allows editor to adjust sessions, rooms, or timeslots (UC-16).

- **6a** System cannot store schedule due to database error  
  - **6a1** CMS informs editor and prevents publication.

## Related Information
- Generated schedule must be produced in HTML format.
- Editor may edit schedule before announcement (UC-16).
