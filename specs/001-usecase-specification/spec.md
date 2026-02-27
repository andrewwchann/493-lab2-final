# Feature Specification: Use Case Specification Expansion

**Feature Branch**: `001-usecase-specification`  
**Created**: February 5, 2026  
**Status**: Draft  
**Input**: Authoritative use cases in `use_cases/` and acceptance tests in
`acceptance_tests/`. User prompt: "turns all use cases into a more detailed specification, including functional requirements. This is done by reasoning about how to expand the user story. In our case, the flows from the use case should be copied directly over, and then functional requirements extracted from them." (non-authoritative).

## Clarifications

### Session 2026-02-05

- Q: What identifier is used for login in UC-03? → A: UC-03 specifies email; UC-05 mentions email/username - using email/username to preserve UC-05 flow fidelity.
- Q: What password rules apply for registration and changes? → A: UC-02 states password security standards are not specified (Open Issue); password validation occurs but specific rules are not defined in use cases.
- Q: Do review deadlines restrict form access, submission, or both? → A: Deadlines restrict both form access and review submission.
- Q: After publication, who can view the conference schedule? → A: The schedule is publicly viewable (UC-20 states "publicly accessible").
- Q: If payment succeeds but ticket generation fails, is registration confirmed? → A: Registration is confirmed and the ticket is delayed.

### Session 2026-02-06

- Q: What does "authorized user" mean? → A: A registered, authenticated user with the role required by the specific use case (author/reviewer/editor/attendee).
- Q: What is a "role-based dashboard"? → A: A dashboard view that exposes only the modules permitted for the authenticated user's role.
- Q: Are review form field types and scales specified? → A: Required fields are ratings/scores, comments, and a recommendation; scoring scales are not specified in use cases/tests.
- Q: Are schedule publication notifications required? → A: Notifications are optional; publication is still successful if notification delivery fails.
- Q: How do UC-18 and UC-20 publication steps relate? → A: UC-18 ends after draft generation/preview; publication is handled exclusively in UC-20 with confirmation, finalization, public visibility, and failure handling requirements.

## Scope

In Scope:
- Account registration, login, and password change for CMS users. (UC-01 to UC-05)
- Author submission workflows, including drafts and manuscript updates. (UC-06 to UC-09)
- Reviewer assignment, acceptance, review submission, and editor decisions. (UC-10 to UC-17)
- Conference schedule generation, editing, and publication. (UC-18 to UC-20)
- Attendee pricing display, registration, payment, and ticket confirmation. (UC-21 to UC-23)

Out of Scope:
- Refunds, chargebacks, or payment disputes beyond successful or declined payments.
- Conference content outside of accepted papers (for example, workshops not represented in submissions).
- Administrative user management beyond what is described in the use cases.
- Performance targets, availability SLAs, accessibility requirements, and browser support constraints beyond what is explicitly stated in use cases or acceptance tests.

## Required Data Fields Summary

The following required fields are explicitly stated in use cases and acceptance tests. Any fields not listed are not specified and must not be assumed.

- Registration (UC-01, UC-02): email, password. Other registration fields are not specified.
- Login (UC-03, UC-05): identifier (email or username) and password.
- Submission (UC-06, UC-08): author names, affiliation or contact information, abstract, keywords, and manuscript file. Title/identifier is required at least for draft saves and downstream reviewer displays (UC-09, UC-11, UC-13).
- Manuscript Update (UC-07): replacement manuscript file plus required metadata still present (authors, abstract, keywords).
- Review Form (UC-12, UC-14): ratings/scores, comments, recommendation (scales not specified).
- Schedule Items (UC-18, UC-19): session, room, and timeslot assignments for accepted papers.
- Pricing (UC-23): attendee category and price.
- Registration/Payment (UC-21): attendee category selection and credit card payment information (specific card fields are not specified).
- Ticket (UC-22): attendee name, registration category, payment confirmation number, and unique ticket/reference ID.

## Constitution Check

- Use-case-only scope preserved; no requirements beyond UC-01 to UC-23 and acceptance tests. **PASS**
- Use-case flows preserved in meaning; rewording only for clarity. **PASS**
- All requirements traceable to use cases and acceptance tests. **PASS**
- MVC separation and vanilla web stack constraints acknowledged (implementation detail deferred). **PASS**

## User Scenarios & Testing *(mandatory)*

All user stories and acceptance scenarios are derived from the use case
and acceptance test files and include UC-XX references.

### User Story 1 - Register Account (Priority: P1)

As a guest, I want to register a CMS account so I can access CMS features. (UC-01)

**Why this priority**: Account creation is a prerequisite for all authenticated workflows.

**Independent Test**: Can be fully tested by completing registration and verifying redirect to login without any other CMS features.

**Flow (from UC-01)**:
1. User requests to register on the CMS system.
2. System displays the registration form.
3. User fills out the registration form with required information.
4. User submits the registration form.
5. System validates the provided email and password.
6. System stores the new user account information.
7. System redirects the user to the login page.

**Acceptance Scenarios**:
1. **Given** a guest completes the registration form with valid data, **When** they submit, **Then** the account is created and the user is redirected to login. (UC-01; UC01-AT-01)
2. **Given** a guest enters invalid or duplicate data, **When** they submit, **Then** registration is rejected with an error and no account is created. (UC-01; UC01-AT-02, UC01-AT-03, UC01-AT-04)

---

### User Story 2 - Validate Registration Credentials (Priority: P1)

As a guest, I want my registration email and password validated so I know whether my inputs are acceptable before registration proceeds. (UC-02)

**Why this priority**: Credential validation protects data integrity and prevents invalid accounts.

**Independent Test**: Can be fully tested by submitting valid and invalid credentials on the registration form.

**Flow (from UC-02)**:
1. User submits the registration form with an email address and password.
2. System validates the email address format.
3. System checks that the email address is unique.
4. System validates that the password meets password security standards.
5. System confirms the credentials are valid and allows registration to continue.

**Acceptance Scenarios**:
1. **Given** a guest submits a valid, unique email and valid password, **When** validation runs, **Then** the system accepts the credentials and registration proceeds. (UC-02; UC02-AT-01)
2. **Given** a guest submits an invalid email or weak password, **When** validation runs, **Then** the system rejects the credentials with clear error feedback. (UC-02; UC02-AT-02, UC02-AT-04)

---

### User Story 3 - Log In to CMS (Priority: P1)

As a registered user, I want to log in so I can access my role-based CMS dashboard. (UC-03)

**Why this priority**: Login is required to use any authenticated CMS features.

**Independent Test**: Can be fully tested by logging in with valid and invalid credentials.

**Clarification**: Login identifier accepts either email or username, as allowed in UC-05.

**Flow (from UC-03)**:
1. User navigates to the CMS login page.
2. CMS displays the login form requesting email and password.
3. User enters registered email and password.
4. User submits the login form.
5. CMS validates the email exists in the user database.
6. CMS verifies the password matches the stored credentials.
7. CMS creates an authenticated session for the user.
8. CMS redirects the user to their dashboard based on role.
9. CMS displays a successful login confirmation.

**Acceptance Scenarios**:
1. **Given** a registered user enters valid credentials, **When** they submit the login form, **Then** a session is created and the dashboard is shown. (UC-03; UC03-AT-01)
2. **Given** the login service is unavailable, **When** the user submits credentials, **Then** the system shows a retry-later error and no session is created. (UC-03; UC03-AT-05)

---

### User Story 4 - Change Account Password (Priority: P1)

As an authenticated user, I want to change my password so I can maintain account security. (UC-04)

**Why this priority**: Password management is a core account security feature.

**Independent Test**: Can be fully tested by changing the password and then logging in with the new password.

**Flow (from UC-04)**:
1. User navigates to Account Settings.
2. CMS displays the Change Password form.
3. User enters their current password.
4. User enters a new password and confirms it.
5. CMS validates the current password matches stored credentials.
6. CMS validates the new password satisfies password rules.
7. CMS updates the password securely in the database.
8. CMS confirms the password change was successful.
9. User continues using CMS with unchanged session, but future logins require the new password.

**Acceptance Scenarios**:
1. **Given** the user provides a correct current password and valid new password, **When** they submit the change, **Then** the password is updated for future logins. (UC-04; UC04-AT-01)
2. **Given** the user provides an incorrect current password or invalid new password, **When** they submit, **Then** the system rejects the change with an error. (UC-04; UC04-AT-02, UC04-AT-04)

---

### User Story 5 - Handle Login Failure (Priority: P1)

As a user, I want clear feedback when login fails so I can correct my credentials without gaining unauthorized access. (UC-05)

**Why this priority**: Prevents unauthorized access while supporting user recovery.

**Independent Test**: Can be fully tested by attempting login with invalid credentials and observing error feedback.

**Flow (from UC-05)**:
1. User navigates to the CMS login page.
2. CMS displays the login form requesting email/username and password.
3. User enters credentials.
4. User submits the login form.
5. CMS attempts to match the credentials against stored account records.
6. CMS determines the credentials do not match (unknown email/username or incorrect password).
7. CMS denies authentication and does not create a session.
8. CMS displays an error message indicating the login attempt failed.
9. CMS allows the user to retry login.

**Acceptance Scenarios**:
1. **Given** a user submits an incorrect password, **When** they attempt login, **Then** access is denied and an error is shown. (UC-05; UC05-AT-01)
2. **Given** a user submits an unregistered account, **When** they attempt login, **Then** access is denied and an account-not-found error is shown. (UC-05; UC05-AT-02)

---

### User Story 6 - Submit Paper Manuscript (Priority: P2)

As an author, I want to submit a complete paper with all required metadata so it can enter the review process. (UC-06)

**Why this priority**: Paper submission is the core input to the review lifecycle.

**Independent Test**: Can be fully tested by submitting a valid paper and verifying it is marked Submitted.

**Flow (from UC-06)**:
1. Author navigates to Submit Paper.
2. CMS displays the submission form requiring author names and affiliation or contact information, paper abstract, keywords, and main source file upload.
3. Author enters all required metadata fields.
4. Author uploads the manuscript file in an accepted format (PDF, Word, LaTeX).
5. CMS validates that the manuscript file size is less than or equal to 7MB.
6. Author reviews submission details.
7. Author selects Submit Paper.
8. CMS stores the submission record and manuscript file in the database.
9. CMS confirms successful submission and marks paper status as Submitted.

**Acceptance Scenarios**:
1. **Given** an author provides complete metadata and a compliant file, **When** they submit, **Then** the paper is stored and marked Submitted. (UC-06; UC06-AT-01 in UC-06 suite)
2. **Given** the manuscript file violates format or size constraints, **When** the author submits, **Then** the system blocks submission with a clear error. (UC-06; UC06-AT-03, UC06-AT-04 in UC-06 suite)

---

### User Story 7 - Update Submitted Paper Manuscript (Priority: P2)

As an author, I want to update a submitted manuscript while keeping the submission valid for review. (UC-07)

**Why this priority**: Authors need to correct or improve submissions before review starts.

**Independent Test**: Can be fully tested by replacing a manuscript and verifying the prior version is preserved on failure.

**Flow (from UC-07)**:
1. Author opens My Submissions and selects a submitted paper.
2. CMS displays submission metadata (authors, abstract, keywords, manuscript file).
3. Author selects Replace Manuscript File.
4. Author uploads a new manuscript file in an accepted format (PDF, Word, LaTeX).
5. CMS validates file type and ensures file size is less than or equal to 7MB.
6. CMS confirms required metadata fields are still present (authors, abstract, keywords).
7. Author submits the update request.
8. CMS overwrites the previous manuscript file while preserving submission record.
9. CMS confirms the manuscript update was successful.

**Acceptance Scenarios**:
1. **Given** a valid replacement file, **When** the author confirms the update, **Then** the manuscript is replaced successfully. (UC-07; UC06-AT-01 in UC-07 suite)
2. **Given** the upload fails, **When** the author attempts a replacement, **Then** the prior manuscript remains intact and an error is shown. (UC-07; UC06-AT-05 in UC-07 suite)

---

### User Story 8 - Validate Paper Submission Fields (Priority: P2)

As an author, I want submission validation to catch missing or invalid fields so incomplete papers are not submitted. (UC-08)

**Why this priority**: Prevents incomplete submissions from entering review.

**Independent Test**: Can be fully tested by submitting papers with missing fields and invalid files.

**Flow (from UC-08)**:
1. Author completes submission metadata fields and uploads a manuscript file.
2. Author selects Submit Paper or Confirm Update.
3. CMS validates required metadata fields are present: author names and affiliation or contact information, paper abstract, keywords.
4. CMS validates that a manuscript file is uploaded.
5. CMS validates manuscript format is one of PDF, Word, LaTeX.
6. CMS validates manuscript file size is less than or equal to 7MB.
7. CMS confirms validation success and allows submission or update to proceed.

**Acceptance Scenarios**:
1. **Given** required metadata is missing, **When** the author submits, **Then** the system blocks submission and highlights missing fields. (UC-08; UC06-AT-02, UC06-AT-03, UC06-AT-04 in UC-08 suite)
2. **Given** the manuscript file is missing or invalid, **When** the author submits, **Then** the system blocks submission with a clear error. (UC-08; UC06-AT-05, UC06-AT-06 in UC-08 suite)

---

### User Story 9 - Save Submission Progress (Priority: P2)

As an author, I want to save a draft submission so I can return and complete it later. (UC-09)

**Why this priority**: Drafts support longer submissions without data loss.

**Independent Test**: Can be fully tested by saving a draft and resuming it later.

**Flow (from UC-09)**:
1. Author navigates to the Paper Submission page and begins entering submission information.
2. CMS displays a Save Draft option at any time during form completion.
3. Author enters some submission data and may or may not upload a manuscript yet.
4. Author selects Save Draft.
5. CMS validates that the draft contains the minimum required information to save.
6. CMS stores the draft submission record in the database with status Draft.
7. CMS confirms the draft was saved successfully.
8. Later, author returns to My Submissions, selects the draft, and resumes editing from the saved state.

**Acceptance Scenarios**:
1. **Given** an author provides minimum draft data, **When** they click Save Draft, **Then** a draft is created and can be resumed later. (UC-09; UC06-AT-01, UC06-AT-02 in UC-09 suite)
2. **Given** required draft minimums are missing, **When** they click Save Draft, **Then** the draft is not saved and an error is shown. (UC-09; UC06-AT-03 in UC-09 suite)

---

### User Story 10 - Assign Reviewers to Paper (Priority: P3)

As an editor, I want to assign exactly three qualified reviewers so the review process can begin. (UC-10)

**Why this priority**: Review cannot begin without proper assignments.

**Independent Test**: Can be fully tested by assigning reviewers and verifying invitation delivery.

**Flow (from UC-10)**:
1. Editor opens the submitted paper record.
2. CMS displays the reviewer assignment interface.
3. Editor enters reviewer email addresses.
4. CMS validates each reviewer email exists in the system.
5. CMS checks that no reviewer exceeds the workload limit of 5 assigned papers.
6. Editor assigns exactly 3 reviewers to the paper.
7. CMS stores reviewer assignments in the database.
8. CMS sends review invitations to the assigned reviewers.
9. CMS confirms successful reviewer assignment.

**Acceptance Scenarios**:
1. **Given** three valid reviewers are selected, **When** the editor submits the assignment, **Then** invitations are sent and the paper enters review. (UC-10; UC06-AT-01 in UC-10 suite)
2. **Given** a reviewer email is invalid or the count is not exactly three, **When** the editor submits, **Then** the system blocks the assignment with an error. (UC-10; UC06-AT-02, UC06-AT-04 in UC-10 suite)

---

### User Story 11 - Reviewer View Accepted Assigned Papers (Priority: P3)

As a reviewer, I want to see only accepted assignments so I can access the correct review work. (UC-11)

**Why this priority**: Reviewers need access to accepted papers without seeing unaccepted or unauthorized items.

**Independent Test**: Can be fully tested by accepting and declining invitations and verifying the list.

**Flow (from UC-11)**:
1. Reviewer logs into CMS and opens the reviewer dashboard.
2. Reviewer selects My Assigned Papers.
3. CMS retrieves the list of papers assigned to the reviewer.
4. CMS filters the list to include only assignments the reviewer has accepted.
5. CMS displays each accepted paper with title, abstract summary, review deadline, and link to open the review form.
6. Reviewer selects a paper from the list.
7. CMS opens the review workspace for that paper.

**Acceptance Scenarios**:
1. **Given** a reviewer accepted an assignment, **When** they open My Assigned Papers, **Then** the accepted paper is listed with a review access link. (UC-11; UC06-AT-01 in UC-11 suite)
2. **Given** a reviewer has no accepted assignments, **When** they open My Assigned Papers, **Then** an empty-state message is displayed. (UC-11; UC06-AT-02 in UC-11 suite)

---

### User Story 12 - Reviewer Access Review Form (Priority: P3)

As a reviewer, I want to open a review form for an accepted assignment so I can begin my evaluation. (UC-12)

**Why this priority**: Review work cannot begin without access to the form.

**Independent Test**: Can be fully tested by accepting an assignment and opening its review form.

**Flow (from UC-12)**:
1. Reviewer opens My Assigned Papers.
2. CMS displays accepted papers available for review.
3. Reviewer selects a specific paper.
4. Reviewer clicks Open Review Form.
5. CMS verifies reviewer authorization for that paper assignment.
6. CMS retrieves the review form template and any existing saved progress.
7. CMS displays the review form fields (scores, comments, recommendation).
8. Reviewer begins entering review information.
9. CMS allows reviewer to save progress or proceed to final submission.

**Acceptance Scenarios**:
1. **Given** a reviewer accepted the assignment, **When** they open the review form, **Then** the form is displayed for completion. (UC-12; UC06-AT-01 in UC-12 suite)
2. **Given** the assignment was not accepted or the deadline passed, **When** the reviewer attempts access, **Then** the system blocks access with a clear message. (UC-12; UC06-AT-02, UC06-AT-04 in UC-12 suite)

---

### User Story 13 - Reviewer Accept or Decline Invitation (Priority: P3)

As a reviewer, I want to accept or decline invitations so only willing reviewers are assigned. (UC-13)

**Why this priority**: Explicit acceptance is required to ensure reviewer commitment.

**Independent Test**: Can be fully tested by responding to an invitation and verifying editor notification.

**Flow (from UC-13)**:
1. Reviewer opens the invitation link or assigned-paper notification.
2. CMS displays the paper title, abstract, and review deadline.
3. Reviewer selects Accept Assignment.
4. CMS records the acceptance response in the database.
5. CMS updates the reviewer dashboard to include the assigned paper.
6. CMS notifies the editor that the reviewer has accepted.
7. CMS enables the review form submission workflow.

**Acceptance Scenarios**:
1. **Given** a reviewer accepts an invitation, **When** the response is submitted, **Then** the acceptance is recorded and the editor is notified. (UC-13; UC06-AT-01 in UC-13 suite)
2. **Given** a reviewer declines, **When** the response is submitted, **Then** the decline is recorded and the editor is notified to reassign. (UC-13; UC06-AT-02 in UC-13 suite)

---

### User Story 14 - Submit Completed Review Form (Priority: P3)

As a reviewer, I want to submit a completed review so the editor can evaluate the paper. (UC-14)

**Why this priority**: Reviews are required for final decisions.

**Independent Test**: Can be fully tested by submitting a complete review and verifying editor access.

**Flow (from UC-14)**:
1. Reviewer opens the assigned paper from their review dashboard.
2. CMS displays the review form with required evaluation fields.
3. Reviewer completes all required fields (ratings, comments, recommendation).
4. Reviewer submits the review form.
5. CMS validates that all required review fields are complete.
6. CMS stores the completed review in the database.
7. CMS confirms successful review submission.
8. CMS makes the review accessible to the editor for decision-making.

**Acceptance Scenarios**:
1. **Given** a reviewer completes all required fields, **When** they submit, **Then** the review is stored and available to the editor. (UC-14; UC06-AT-01 in UC-14 suite)
2. **Given** required fields are missing or the deadline passed, **When** they submit, **Then** the system blocks submission with an error. (UC-14; UC06-AT-02, UC06-AT-04 in UC-14 suite)

---

### User Story 15 - Editor Receive Completed Review Forms (Priority: P3)

As an editor, I want access to the full set of reviews once all are completed so I can make a decision. (UC-15)

**Why this priority**: Final decisions require all reviews to be available.

**Independent Test**: Can be fully tested by completing three reviews and verifying editor access.

**Flow (from UC-15)**:
1. CMS detects that the third required review form for a paper has been submitted.
2. CMS verifies that the required number of completed reviews for the paper is satisfied.
3. CMS stores or locks the completed review set for editor access.
4. CMS updates the paper status to Reviews Complete.
5. CMS notifies the editor that the paper is ready for decision.
6. Editor opens the paper in the editor dashboard.
7. CMS displays all completed review forms for that paper.
8. Editor confirms that the reviews are available and proceeds to make the final decision.

**Acceptance Scenarios**:
1. **Given** three reviews are submitted, **When** the third review is submitted, **Then** the paper is marked Reviews Complete and reviews become available to the editor. (UC-15; UC15-AT-01)
2. **Given** fewer than three reviews exist, **When** a review is submitted, **Then** the paper remains Under Review and no completion notification is sent. (UC-15; UC15-AT-02)

---

### User Story 16 - Make Final Paper Decision (Priority: P3)

As an editor, I want to record a final accept or reject decision so authors receive an outcome. (UC-16)

**Why this priority**: Decisions are the primary outcome of the review process.

**Independent Test**: Can be fully tested by making a decision after three reviews are complete.

**Flow (from UC-16)**:
1. Editor opens the paper review summary page.
2. CMS displays all three completed review forms.
3. Editor evaluates reviewer feedback and recommendations.
4. Editor selects a final decision: Accept or Reject.
5. Editor confirms the decision submission.
6. CMS validates that exactly three reviews are completed.
7. CMS records the decision in the database.
8. CMS notifies the author of the final decision.
9. CMS marks the paper status as Accepted or Rejected.

**Acceptance Scenarios**:
1. **Given** three reviews are complete, **When** the editor submits a decision, **Then** the decision is stored and the paper status is updated. (UC-16; UC16-AT-01)
2. **Given** fewer than three reviews are complete, **When** the editor attempts a decision, **Then** the system blocks submission with a clear message. (UC-16; UC16-AT-02)

---

### User Story 17 - Notify Author of Final Decision (Priority: P3)

As an author, I want to receive the final decision so I know the outcome of my submission. (UC-17)

**Why this priority**: Authors require timely, reliable decision communication.

**Independent Test**: Can be fully tested by issuing a decision and verifying author notification.

**Flow (from UC-17)**:
1. Editor completes a final decision for a paper (Accept or Reject).
2. CMS retrieves the author contact information.
3. CMS generates the official decision message based on outcome.
4. CMS sends the decision notification to the author via email and dashboard alert.
5. CMS updates the paper status in the author submission list.
6. CMS logs that the notification was delivered successfully.

**Acceptance Scenarios**:
1. **Given** a final decision is recorded, **When** notification is triggered, **Then** the author receives the decision via email and dashboard. (UC-17; UC06-AT-01 in UC-17 suite)
2. **Given** email delivery fails, **When** notification is triggered, **Then** the decision is still available in the author dashboard and the failure is logged. (UC-17; UC06-AT-02, UC06-AT-03 in UC-17 suite)

---

### User Story 18 - Generate Conference Schedule (Priority: P4)

As an editor, I want to generate a conference schedule so accepted papers are organized into sessions. (UC-18)

**Why this priority**: Scheduling is required to publish the conference program.

**Independent Test**: Can be fully tested by generating a schedule when accepted papers exist.

**Clarification**: Schedule publication is handled in UC-20; UC-18 ends after draft generation and preview.

**Flow (from UC-18)**:
1. Editor navigates to the Scheduling module.
2. CMS displays the list of accepted papers eligible for scheduling.
3. Editor selects Generate Schedule.
4. CMS invokes the scheduling algorithm to assign papers into sessions, rooms, and timeslots.
5. CMS produces a draft schedule in HTML program format.
6. CMS stores the generated schedule in the database.
7. CMS displays the schedule preview for editor review.
8. CMS marks the schedule as Draft and indicates it is ready for publication via UC-20.

**Acceptance Scenarios**:
1. **Given** accepted papers exist, **When** the editor generates the schedule, **Then** a draft schedule is produced, stored, and ready for publication via UC-20. (UC-18; UC15-AT-01 in UC-18 suite)
2. **Given** no accepted papers exist, **When** the editor attempts generation, **Then** the system blocks schedule creation with an error. (UC-18; UC15-AT-02 in UC-18 suite)

---

### User Story 19 - Edit Conference Schedule (Priority: P4)

As an editor, I want to edit the draft schedule so conflicts can be resolved before publication. (UC-19)

**Why this priority**: Editing enables conflict resolution and schedule accuracy.

**Independent Test**: Can be fully tested by applying edits and verifying conflict prevention.

**Flow (from UC-19)**:
1. Editor navigates to the Scheduling module.
2. CMS displays the current draft schedule and editing controls.
3. Editor selects a schedule element to modify (session, room, or timeslot).
4. CMS displays editable fields for the selected element.
5. Editor changes the assignment.
6. CMS validates the edit for basic conflicts.
7. Editor saves the changes.
8. CMS stores the updated draft schedule in the database.
9. CMS refreshes the schedule preview reflecting the edits.

**Acceptance Scenarios**:
1. **Given** a draft schedule exists, **When** the editor makes a valid edit, **Then** the draft is saved and preview updated. (UC-19; UC16-AT-01 in UC-19 suite)
2. **Given** an edit causes a conflict or invalid time, **When** the editor attempts to save, **Then** the system blocks the save with clear errors. (UC-19; UC16-AT-02, UC16-AT-03 in UC-19 suite)

---

### User Story 20 - Publish Final Conference Schedule (Priority: P4)

As an editor, I want to publish the finalized schedule so it is publicly visible. (UC-20)

**Why this priority**: Publication communicates the final program to attendees.

**Independent Test**: Can be fully tested by publishing a finalized draft and verifying public visibility.

**Flow (from UC-20)**:
1. Editor navigates to the Scheduling module.
2. CMS displays the finalized draft schedule preview.
3. Editor selects Publish Schedule.
4. CMS requests confirmation that the schedule is final.
5. Editor confirms publication.
6. CMS marks the schedule status as Final in the database.
7. CMS publishes the schedule HTML program to the public conference website.
8. CMS optionally sends an announcement notification to registered users.
9. CMS confirms that the schedule is now publicly accessible.

**Acceptance Scenarios**:
1. **Given** a finalized draft schedule exists, **When** the editor confirms publish, **Then** the schedule becomes publicly accessible. (UC-20; UC06-AT-01 in UC-20 suite)
2. **Given** publication or finalization fails, **When** the editor confirms publish, **Then** the schedule remains in draft and an error is shown. (UC-20; UC06-AT-03, UC06-AT-04 in UC-20 suite)
3. **Given** publication succeeds, **When** notification delivery fails, **Then** the schedule remains public and the notification failure is logged for retry. (UC-20; UC06-AT-05 in UC-20 suite)

---

### User Story 21 - Register for Conference and Pay (Priority: P5)

As a guest or attendee, I want to register and pay by credit card so my attendance is confirmed. (UC-21)

**Why this priority**: Registration and payment confirm attendance and funding.

**Independent Test**: Can be fully tested by completing payment and receiving confirmation.

**Flow (from UC-21)**:
1. Attendee navigates to the Conference Registration page.
2. CMS displays available attendee categories and pricing.
3. Attendee selects the appropriate registration type.
4. CMS calculates the total fee and displays payment form.
5. Attendee enters valid credit card payment information.
6. Attendee submits the payment request.
7. CMS sends payment details securely to the payment gateway.
8. Payment gateway approves the transaction.
9. CMS stores the payment record and marks the attendee as registered.
10. CMS generates a confirmation ticket or receipt.
11. CMS displays payment confirmation to the attendee.

**Acceptance Scenarios**:
1. **Given** payment is approved, **When** the attendee submits payment, **Then** registration is confirmed and a ticket is generated. (UC-21; UC15-AT-01 in UC-21 suite)
2. **Given** payment is declined, **When** the attendee submits payment, **Then** registration remains incomplete and a decline message is shown. (UC-21; UC15-AT-03 in UC-21 suite)

---

### User Story 22 - Generate Registration Confirmation Ticket (Priority: P5)

As an attendee, I want a confirmation ticket after payment so I have proof of registration. (UC-22)

**Why this priority**: Tickets are required proof of successful registration.

**Independent Test**: Can be fully tested by completing payment and verifying ticket availability.

**Flow (from UC-22)**:
1. Attendee completes credit card payment successfully.
2. CMS records the payment transaction in the database.
3. CMS triggers ticket generation for the registered attendee.
4. CMS generates a confirmation ticket containing attendee name, registration category, payment confirmation number, and unique ticket or reference ID.
5. CMS stores the ticket or receipt record in the database.
6. CMS displays the confirmation ticket in the attendee dashboard.
7. CMS optionally emails the ticket to the attendee.
8. CMS logs ticket generation as successful.

**Acceptance Scenarios**:
1. **Given** payment is approved, **When** ticket generation runs, **Then** a ticket with a unique ID is stored and visible in the dashboard. (UC-22; UC16-AT-01 in UC-22 suite)
2. **Given** ticket generation fails, **When** the system attempts to create the ticket, **Then** registration remains confirmed but the ticket is delayed with notice. (UC-22; UC16-AT-02 in UC-22 suite)

---

### User Story 23 - View Conference Pricing by Attendee Type (Priority: P5)

As an attendee, I want to view pricing by category so I can decide before payment. (UC-23)

**Why this priority**: Pricing visibility is required before registration and payment.

**Independent Test**: Can be fully tested by viewing pricing and selecting a valid category.

**Flow (from UC-23)**:
1. Attendee navigates to the Conference Registration section.
2. CMS displays a list of attendee categories.
3. Attendee selects View Pricing.
4. CMS retrieves the fee structure from the database.
5. CMS displays the registration prices clearly for each category.
6. Attendee selects their appropriate category.
7. CMS uses the selected category fee to calculate total cost for payment.

**Acceptance Scenarios**:
1. **Given** pricing is configured, **When** the attendee requests pricing, **Then** the correct fees are displayed for each category. (UC-23; UC06-AT-01 in UC-23 suite)
2. **Given** pricing configuration is missing, **When** the attendee requests pricing, **Then** the system blocks registration with an error. (UC-23; UC06-AT-02 in UC-23 suite)

---

### Edge Cases

- Registration attempted with an email already in use is rejected with a clear error. (UC-01, UC-02)
- Login attempts during authentication service outage show a retry-later error and do not create sessions. (UC-03, UC-05)
- Manuscript file size exactly 7.0MB is accepted; any size above 7.0MB is rejected. (UC-06, UC-08)
- Draft submission attempted without a title or identifier does not save. (UC-09)
- Reviewer access to a paper without an accepted invitation is blocked. (UC-12)
- Reviewer workload exceeds 5 assignments, blocking further assignments. (UC-10)
- Editor attempts to make a decision with fewer than three reviews is blocked. (UC-16)
- Schedule edits creating a room or time conflict are rejected. (UC-19)
- Pricing table missing prevents payment flow from starting. (UC-23)
- Payment succeeds but ticket generation fails, resulting in delayed ticket delivery with registration preserved. (UC-21, UC-22)
- Notification delivery fails after decisions or schedule publication; core state changes still persist. (UC-17, UC-20)
- Upload or storage service failure during submission or manuscript update prevents completion and preserves prior data. (UC-06, UC-07)
- Payment gateway unavailable blocks registration and prompts retry later without confirming registration. (UC-21)
- Scheduling algorithm failure prevents schedule generation and leaves schedule in draft. (UC-18)
- Public website publication failure keeps schedule in draft and reports error. (UC-20)

## Assumptions

- Registration required fields are only those explicitly listed in UC-01 and UC-01 acceptance tests; no additional fields are assumed. (UC-01)
- Password validation criteria are exactly those exercised by UC-02 and UC-04 acceptance tests; no additional standards are implied. (UC-02, UC-04)
- Submission, review, and registration windows are configured by organizers and enforced by the CMS. (UC-06, UC-09, UC-12, UC-14, UC-21)
- Review deadlines restrict both form access and review submission. (UC-12, UC-14)
- For UC-21, guests may access pricing and initiate registration/payment; attendee role-based access applies after approved registration for viewing protected registration or ticket records. (UC-21, UC-22, UC-23)
- Published schedules are publicly viewable. (UC-20)
- CMS data storage technology is intentionally unspecified; only a generic CMS database is assumed. (UC-01 to UC-23)
- Pricing categories and fees are preconfigured in the CMS database; pricing configuration UI is out of scope. (UC-23)

## Requirements *(mandatory)*

Each requirement cites the originating use case and acceptance test identifier(s).

### Functional Requirements

- **FR-001**: System MUST allow a guest to register an account with required fields and redirect to login after successful creation. (Refs: UC-01; Tests: UC01-AT-01)
- **FR-002**: System MUST validate registration email format and uniqueness and reject invalid or duplicate emails with field-level errors. (Refs: UC-02; Tests: UC02-AT-02, UC02-AT-03, UC01-AT-02, UC01-AT-03)
- **FR-003**: System MUST validate passwords per the UC-02 and UC-04 acceptance tests and reject invalid passwords with corrective feedback. (Refs: UC-02, UC-04; Tests: UC02-AT-04, UC01-AT-04, UC01-AT-05, UC04-AT-04)
- **FR-004**: System MUST prevent registration when required fields are missing and display required-field errors. (Refs: UC-01; Tests: UC01-AT-06)
- **FR-005**: System MUST authenticate registered users with valid credentials, create a session, and route them to the role-appropriate dashboard. (Refs: UC-03; Tests: UC03-AT-01)
- **FR-006**: System MUST deny login attempts for unknown accounts or incorrect passwords, show clear errors, and avoid creating sessions. (Refs: UC-05; Tests: UC05-AT-01, UC05-AT-02)
- **FR-007**: System MUST block login submissions with missing required fields and highlight the missing inputs. (Refs: UC-03, UC-05; Tests: UC03-AT-04, UC05-AT-03)
- **FR-008**: System MUST display a retry-later error and avoid session creation when authentication services are unavailable. (Refs: UC-03, UC-05; Tests: UC03-AT-05, UC05-AT-04)
- **FR-009**: System MUST allow authenticated users to change passwords by entering the correct current password and a valid new password, updating future login credentials. (Refs: UC-04; Tests: UC04-AT-01)
- **FR-010**: System MUST reject password changes when the current password is incorrect, the confirmation does not match, or the new password is invalid. (Refs: UC-04; Tests: UC04-AT-02, UC04-AT-03, UC04-AT-04)
- **FR-011**: System MUST allow authors to submit papers with required metadata and a manuscript file, storing the submission and marking status as Submitted on success. (Refs: UC-06; Tests: UC06-AT-01 in UC-06 suite)
- **FR-012**: System MUST enforce required submission metadata fields and require a manuscript file before allowing submission or update. (Refs: UC-08; Tests: UC06-AT-02, UC06-AT-03, UC06-AT-04, UC06-AT-05 in UC-08 suite)
- **FR-013**: System MUST enforce manuscript upload formats of `.pdf`, `.doc`, `.docx`, `.tex`, or `.zip` (LaTeX source bundle) and a maximum size of 7.0MB for both submission and updates. (Refs: UC-06, UC-07, UC-08; Tests: UC06-AT-03, UC06-AT-04 in UC-06 suite; UC06-AT-02, UC06-AT-03 in UC-07 suite; UC06-AT-06, UC06-AT-07 in UC-08 suite)
- **FR-014**: System MUST allow authors to save drafts at any time with minimum required draft information (at least a title or identifier) and store them with Draft status outside the review workflow. (Refs: UC-09; Tests: UC06-AT-01 in UC-09 suite)
- **FR-015**: System MUST allow authors to resume editing a saved draft with previously entered data restored. (Refs: UC-09; Tests: UC06-AT-02 in UC-09 suite)
- **FR-016**: System MUST reject draft saves that lack the minimum required draft information and show a corrective error. (Refs: UC-09; Tests: UC06-AT-03 in UC-09 suite)
- **FR-017**: System MUST block final submission from a draft after the submission window closes while allowing the draft to be viewed. (Refs: UC-09; Tests: UC06-AT-05 in UC-09 suite)
- **FR-018**: System MUST allow authors to replace a submitted manuscript while preserving the submission record, and retain the prior manuscript if the replacement fails. (Refs: UC-07; Tests: UC06-AT-01, UC06-AT-05 in UC-07 suite)
- **FR-019**: System MUST allow editors to assign exactly three reviewers per submitted paper, validate reviewer existence, enforce a maximum workload of five assignments per reviewer, and send invitations. (Refs: UC-10; Tests: UC06-AT-01, UC06-AT-02, UC06-AT-03, UC06-AT-04 in UC-10 suite)
- **FR-020**: System MUST record reviewer acceptance or decline responses, notify the editor, and enable review access only after acceptance. (Refs: UC-13; Tests: UC06-AT-01, UC06-AT-02 in UC-13 suite)
- **FR-021**: System MUST display only accepted assigned papers to reviewers and block access to unassigned papers. (Refs: UC-11; Tests: UC06-AT-01, UC06-AT-03, UC06-AT-05 in UC-11 suite)
- **FR-022**: System MUST allow review form access only for accepted assignments within the review period and block access when invitations are not accepted or deadlines have passed. (Refs: UC-12; Tests: UC06-AT-01, UC06-AT-02, UC06-AT-04 in UC-12 suite)
- **FR-023**: System MUST accept completed review submissions with required fields, store them for editor access, and block incomplete or late submissions after the deadline. (Refs: UC-14; Tests: UC06-AT-01, UC06-AT-02, UC06-AT-04 in UC-14 suite)
- **FR-024**: System MUST mark papers as Reviews Complete only after exactly three reviews are submitted and make the full review set available to editors, even if notifications fail. (Refs: UC-15; Tests: UC15-AT-01, UC15-AT-02, UC15-AT-03)
- **FR-025**: System MUST allow editors to submit final accept or reject decisions only when three reviews are complete, storing the decision and updating paper status. (Refs: UC-16; Tests: UC16-AT-01, UC16-AT-02)
- **FR-026**: System MUST notify authors of final decisions via email and dashboard, and ensure dashboard visibility even when email delivery fails. (Refs: UC-17; Tests: UC06-AT-01, UC06-AT-02, UC06-AT-03 in UC-17 suite)
- **FR-027**: System MUST allow editors to generate a draft conference schedule when accepted papers exist and store it for preview prior to publication. (Refs: UC-18; Tests: UC15-AT-01, UC15-AT-02 in UC-18 suite)
- **FR-028**: System MUST allow editors to edit draft schedules, prevent conflicts and invalid times, and save or cancel edits without publishing. (Refs: UC-19; Tests: UC16-AT-01, UC16-AT-02, UC16-AT-03, UC16-AT-04 in UC-19 suite)
- **FR-029**: System MUST allow editors to publish a finalized schedule only after confirmation, making it publicly accessible, and keep it in draft if publication fails. (Refs: UC-20; Tests: UC06-AT-01, UC06-AT-02, UC06-AT-03, UC06-AT-04 in UC-20 suite)
- **FR-030**: System MUST display attendee pricing by category and require a valid category selection before payment can proceed. (Refs: UC-23; Tests: UC06-AT-01, UC06-AT-03 in UC-23 suite)
- **FR-031**: System MUST allow guests or attendees to register with credit card payment, confirm registration only on approved payment, and block registration on declined payment. (Refs: UC-21; Tests: UC15-AT-01, UC15-AT-03 in UC-21 suite)
- **FR-032**: System MUST generate and store a confirmation ticket with a unique reference after successful payment, keep the ticket accessible if email fails, and confirm registration even when ticket generation fails (ticket delayed with notice). (Refs: UC-22; Tests: UC16-AT-01, UC16-AT-02, UC16-AT-03 in UC-22 suite; UC15-AT-04 in UC-21 suite)

### Non-Functional Requirements

- **NFR-001**: Access to account, submission, review, and registration data MUST be restricted to authorized roles; credentials and payment details MUST not be exposed to unauthorized users. (Refs: UC-03, UC-05, UC-21)
- **NFR-002**: User-facing error messages MUST avoid exposing sensitive credential or payment details. (Refs: UC-03, UC-05, UC-21)
- **NFR-003**: When external services are unavailable, the system MUST fail safely by preserving data integrity and providing a retry-later message. (Refs: UC-03, UC-06, UC-07, UC-14, UC-21)

### Key Entities *(include if feature involves data)*

- **Account**: User identity with role (author, reviewer, editor, attendee), registration status, and credentials.
- **Submission**: Paper metadata, authorship, status (Draft or Submitted), and submission timestamps.
- **Manuscript File**: The uploaded paper file associated with a submission, including format and size constraints.
- **Review Assignment**: Mapping of paper to reviewer, including invitation status and workload tracking.
- **Review Form or Review**: Reviewer ratings, comments, recommendation, and submission status.
- **Decision**: Final accept or reject outcome for a paper, linked to its review set.
- **Schedule**: Conference sessions, rooms, and timeslots with draft or final status.
- **Pricing Category**: Attendee type and associated fee.
- **Registration**: Attendee registration record, payment status, and completion state.
- **Ticket**: Confirmation record with unique reference ID and attendee details.

### State Definitions

- **Submission**: Draft → Submitted (submission window open).  
- **Review Assignment**: Invited → Accepted | Declined.  
- **Review**: In Progress → Submitted (within review period).  
- **Schedule**: Draft → Final (after publish confirmation).  
- **Registration**: Pending → Approved | Declined.  
- **Ticket**: Generated | Delayed (when ticket generation fails).  

## Dependencies

- Pricing configuration is available for attendee categories before registration opens. (UC-23; FR-030, FR-031)
- Reviewer accounts exist before editors can assign reviewers. (UC-10; FR-019)
- Authentication service supports login and password change flows. (UC-03, UC-04, UC-05; FR-005 to FR-010)
- CMS database supports account, submission, review, decision, schedule, and registration persistence. (UC-01 to UC-23; FR-001, FR-011, FR-018, FR-024, FR-025, FR-027, FR-031, FR-032)
- File upload service supports manuscript submission and replacement. (UC-06, UC-07, UC-08; FR-011, FR-013, FR-018)
- Scheduling algorithm and public website module support schedule generation and publication. (UC-18 to UC-20; FR-027 to FR-029)
- Notification delivery supports reviewer invitations, decision notices, and schedule announcements. (UC-10, UC-13, UC-17, UC-20; FR-019, FR-020, FR-026, FR-029)
- Payment gateway supports conference registration transactions and confirmation. (UC-21, UC-22; FR-031, FR-032)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All UC-01 and UC-02 acceptance tests pass (registration and credential validation). (Refs: UC-01, UC-02; Tests: UC01-AT-01 to UC01-AT-07, UC02-AT-01 to UC02-AT-07)
- **SC-002**: All UC-03 and UC-05 acceptance tests pass (login success and failure handling). (Refs: UC-03, UC-05; Tests: UC03-AT-01 to UC03-AT-05, UC05-AT-01 to UC05-AT-04)
- **SC-003**: All UC-04 acceptance tests pass (password change). (Refs: UC-04; Tests: UC04-AT-01 to UC04-AT-05)
- **SC-004**: All UC-06 to UC-09 acceptance tests pass (submission, update, validation, draft). (Refs: UC-06 to UC-09; Tests: UC06-AT-01 to UC06-AT-06, UC06-AT-01 to UC06-AT-05, UC06-AT-01 to UC06-AT-08, UC06-AT-01 to UC06-AT-05)
- **SC-005**: All UC-10 to UC-14 acceptance tests pass (reviewer assignment, invitation, review access, review submission). (Refs: UC-10 to UC-14; Tests: UC06-AT-01 to UC06-AT-04, UC06-AT-01 to UC06-AT-05, UC06-AT-01 to UC06-AT-05, UC06-AT-01 to UC06-AT-04)
- **SC-006**: All UC-15 to UC-17 acceptance tests pass (reviews complete, final decision, author notification). (Refs: UC-15 to UC-17; Tests: UC15-AT-01 to UC15-AT-05, UC16-AT-01 to UC16-AT-04, UC06-AT-01 to UC06-AT-04)
- **SC-007**: All UC-18 to UC-20 acceptance tests pass (schedule generation, edit, publication). (Refs: UC-18 to UC-20; Tests: UC15-AT-01 to UC15-AT-05, UC16-AT-01 to UC16-AT-05, UC06-AT-01 to UC06-AT-05)
- **SC-008**: All UC-21 to UC-23 acceptance tests pass (pricing, registration, payment, ticket). (Refs: UC-21 to UC-23; Tests: UC15-AT-01 to UC15-AT-04, UC16-AT-01 to UC16-AT-04, UC06-AT-01 to UC06-AT-04)
