# Use Case UC-16: Edit Conference Schedule (REFINED)

## Goal in Context
Allow the editor to edit the generated conference schedule so that conflicts can be resolved and sessions can be adjusted before public publication.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Editor (Conference Organizer)

## Secondary Actors
CMS Database, Public Website Module

## Trigger
Editor selects **Edit Schedule** from the Scheduling module after a draft schedule has been generated (UC-15).

## Success End Condition
The edited schedule is saved successfully, remains in draft until published, and the CMS displays the updated schedule preview.

## Failed End Condition
The schedule cannot be edited or saved due to invalid edits (conflicts) or system/storage errors.

## Preconditions
- Editor is logged into CMS.
- A draft schedule exists in the system (generated via UC-15).
- Accepted papers and session slots exist for scheduling.

## Main Success Scenario
1. Editor navigates to the **Scheduling** module.
2. CMS displays the current draft schedule (HTML program preview) and editing controls.
3. Editor selects a schedule element to modify (session, room, or timeslot).
4. CMS displays editable fields for the selected element.
5. Editor changes the assignment (e.g., moves Paper #42 from Room A 10:00 to Room B 11:00).
6. CMS validates the edit for basic conflicts (e.g., two papers in the same room/time, invalid timeslot).
7. Editor saves the changes.
8. CMS stores the updated draft schedule in the database.
9. CMS refreshes the schedule preview reflecting the edits.

## Extensions
- **6a** Edit creates a room/time conflict  
  - **6a1** CMS highlights the conflicting schedule entries and prevents saving.  
  - **6a2** Editor resolves conflict by selecting a different room or time.

- **6b** Edit uses an invalid timeslot (outside conference hours)  
  - **6b1** CMS rejects the change and prompts editor to select a valid timeslot.

- **7a** Editor cancels edits  
  - **7a1** CMS discards unsaved changes and restores the last saved draft.

- **8a** System cannot store schedule due to database error  
  - **8a1** CMS displays an error and does not overwrite the last saved draft.

## Related Information
- UC-15 generates the initial schedule program in HTML format.
- UC-06 publishes/announces the final schedule publicly.
