# Use Case UC-06: Publish Final Conference Schedule Announcement (REFINED)

## Goal in Context
Allow the editor to publish the finalized conference schedule so that it becomes publicly visible to attendees and participants.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor (Conference Organizer)

## Secondary Actors
CMS Database, Public Website Module, Notification Service

## Trigger
Editor selects **Publish Schedule** after reviewing and editing the draft schedule (UC-15, UC-16).

## Success End Condition
The schedule is marked final, published to the public website, and optionally announced to users.

## Failed End Condition
The schedule is not published due to missing approval, storage error, or publication failure.

## Preconditions
- Editor is logged into CMS.
- A complete draft schedule exists (UC-15).
- Any required edits have been saved (UC-16).
- Schedule has not already been published.

## Main Success Scenario
1. Editor navigates to the Scheduling module.
2. CMS displays the finalized draft schedule preview.
3. Editor selects **Publish Schedule**.
4. CMS requests confirmation that the schedule is final.
5. Editor confirms publication.
6. CMS marks the schedule status as **Final** in the database.
7. CMS publishes the schedule HTML program to the public conference website.
8. CMS optionally sends an announcement notification to registered users.
9. CMS confirms that the schedule is now publicly accessible.

## Extensions
- **4a** Editor cancels publication  
  - **4a1** CMS returns to draft view without publishing.

- **7a** Publication to website fails  
  - **7a1** CMS displays an error and keeps schedule in draft state.

- **6a** Database storage error prevents finalization  
  - **6a1** CMS does not mark schedule final and blocks publishing.

- **8a** Notification delivery fails  
  - **8a1** CMS publishes schedule successfully but logs notification failure for retry.

## Related Information
- UC-15 generates the schedule.
- UC-16 allows editing before publication.
- Once published, schedule becomes visible to all attendees.
