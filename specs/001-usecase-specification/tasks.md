# Implementation Tasks: Use Case Specification Expansion

**Branch**: `001-usecase-specification`  
**Date**: February 5, 2026  
**Spec**: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md`

## Implementation Strategy

Deliver an MVP by completing User Story 1 (registration) end-to-end with MVC structure. Then add each user story phase in priority order, ensuring each phase is independently testable against its acceptance scenarios. Shared models/services are introduced in the earliest story that needs them.

## Constitution Check

- All tasks trace to use cases and acceptance tests. **PASS**
- No tasks introduce features beyond UC-01 to UC-23. **PASS**
- Tasks assume MVC separation and vanilla HTML/CSS/JS only. **PASS**

## Phase 1: Setup (Project Initialization)

- [ ] T001 Create MVC project directories in `src/models`, `src/controllers`, `src/views`, `src/services`, `src/assets` (Trace: UC-01 to UC-23)
- [ ] T002 Create acceptance test workspace in `tests/acceptance` (Trace: UC-01 to UC-23 acceptance suites)
- [ ] T003 Document project structure in `README.md` (Trace: UC-01 to UC-23)

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Define base routing/navigation skeleton in `src/controllers/router.js` (Trace: UC-01 to UC-23 flows)
- [ ] T005 Define shared view helpers in `src/views/helpers.js` (Trace: UC-01 to UC-23 UI flows)
- [ ] T006 Define base data access interfaces in `src/services/data_store.js` (Trace: UC-01 to UC-23 data persistence)

## Phase 3: User Story 1 (Register Account) [Priority P1]

**Story Goal**: Register a new CMS account and redirect to login on success.  
**Independent Test Criteria**: UC01-AT-01 to UC01-AT-07 pass.

- [ ] T007 [US1] Create Account model in `src/models/account.js`
- [ ] T008 [US1] Implement registration validation rules in `src/services/registration_service.js`
- [ ] T009 [US1] Build registration form view in `src/views/register.html`
- [ ] T010 [US1] Implement registration controller in `src/controllers/register_controller.js`
- [ ] T011 [US1] Wire registration route in `src/controllers/router.js`

## Phase 4: User Story 2 (Validate Registration Credentials) [Priority P1]

**Story Goal**: Validate registration email/password before account creation.  
**Independent Test Criteria**: UC02-AT-01 to UC02-AT-07 pass.

- [ ] T012 [US2] Add credential validation logic to `src/services/registration_service.js`
- [ ] T013 [US2] Add validation error rendering in `src/views/register.html`
- [ ] T014 [US2] Update registration controller to surface validation results in `src/controllers/register_controller.js`

## Phase 5: User Story 3 (Log In to CMS) [Priority P1]

**Story Goal**: Authenticate a registered user and show role dashboard.  
**Independent Test Criteria**: UC03-AT-01 to UC03-AT-05 pass.

- [ ] T015 [US3] Create session model in `src/models/session.js`
- [ ] T016 [US3] Implement authentication service in `src/services/auth_service.js`
- [ ] T017 [US3] Build login form view in `src/views/login.html`
- [ ] T018 [US3] Implement login controller in `src/controllers/login_controller.js`
- [ ] T019 [US3] Add dashboard view stubs for roles in `src/views/dashboard.html`
- [ ] T020 [US3] Wire login route in `src/controllers/router.js`

## Phase 6: User Story 4 (Change Account Password) [Priority P1]

**Story Goal**: Allow authenticated users to change passwords.  
**Independent Test Criteria**: UC04-AT-01 to UC04-AT-05 pass.

- [ ] T021 [US4] Add password change service logic in `src/services/auth_service.js`
- [ ] T022 [US4] Build change password view in `src/views/change_password.html`
- [ ] T023 [US4] Implement change password controller in `src/controllers/password_controller.js`
- [ ] T024 [US4] Wire change password route in `src/controllers/router.js`

## Phase 7: User Story 5 (Handle Login Failure) [Priority P1]

**Story Goal**: Deny invalid logins with clear errors.  
**Independent Test Criteria**: UC05-AT-01 to UC05-AT-04 pass.

- [ ] T025 [US5] Add login failure messaging in `src/views/login.html`
- [ ] T026 [US5] Update authentication service failure handling in `src/services/auth_service.js`
- [ ] T027 [US5] Update login controller to display errors in `src/controllers/login_controller.js`

## Phase 8: User Story 6 (Submit Paper Manuscript) [Priority P2]

**Story Goal**: Submit a paper with required metadata and manuscript file.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-06 pass.

- [ ] T028 [US6] Create Submission and Manuscript models in `src/models/submission.js`
- [ ] T029 [US6] Implement submission service in `src/services/submission_service.js`
- [ ] T030 [US6] Build submission form view in `src/views/submit_paper.html`
- [ ] T031 [US6] Implement submission controller in `src/controllers/submission_controller.js`
- [ ] T032 [US6] Wire submission route in `src/controllers/router.js`

## Phase 9: User Story 7 (Update Submitted Paper Manuscript) [Priority P2]

**Story Goal**: Replace an existing manuscript while preserving submission record.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-05 in UC-07 suite pass.

- [ ] T033 [US7] Add manuscript replacement logic in `src/services/submission_service.js`
- [ ] T034 [US7] Build update manuscript view in `src/views/update_manuscript.html`
- [ ] T035 [US7] Implement update controller in `src/controllers/submission_controller.js`

## Phase 10: User Story 8 (Validate Paper Submission Fields) [Priority P2]

**Story Goal**: Block incomplete/invalid submissions with clear errors.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-08 in UC-08 suite pass.

- [ ] T036 [US8] Add submission validation rules in `src/services/submission_service.js`
- [ ] T037 [US8] Update submission view to show validation errors in `src/views/submit_paper.html`
- [ ] T038 [US8] Update submission controller validation flow in `src/controllers/submission_controller.js`

## Phase 11: User Story 9 (Save Submission Progress) [Priority P2]

**Story Goal**: Save and resume draft submissions.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-05 in UC-09 suite pass.

- [ ] T039 [US9] Add draft save logic in `src/services/submission_service.js`
- [ ] T040 [US9] Build draft resume view in `src/views/draft_list.html`
- [ ] T041 [US9] Implement draft resume controller in `src/controllers/submission_controller.js`

## Phase 12: User Story 10 (Assign Reviewers to Paper) [Priority P3]

**Story Goal**: Assign exactly three reviewers with workload limits.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-04 in UC-10 suite pass.

- [ ] T042 [US10] Create ReviewAssignment model in `src/models/review_assignment.js`
- [ ] T043 [US10] Implement reviewer assignment service in `src/services/review_service.js`
- [ ] T044 [US10] Build reviewer assignment view in `src/views/assign_reviewers.html`
- [ ] T045 [US10] Implement reviewer assignment controller in `src/controllers/review_controller.js`

## Phase 13: User Story 11 (Reviewer View Accepted Assigned Papers) [Priority P3]

**Story Goal**: List accepted assigned papers for reviewers.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-05 in UC-11 suite pass.

- [ ] T046 [US11] Add reviewer assignments retrieval in `src/services/review_service.js`
- [ ] T047 [US11] Build assigned papers view in `src/views/reviewer_assignments.html`
- [ ] T048 [US11] Implement reviewer dashboard controller in `src/controllers/review_controller.js`

## Phase 14: User Story 12 (Reviewer Access Review Form) [Priority P3]

**Story Goal**: Allow accepted reviewers to open review forms.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-05 in UC-12 suite pass.

- [ ] T049 [US12] Add review form access logic in `src/services/review_service.js`
- [ ] T050 [US12] Build review form view in `src/views/review_form.html`
- [ ] T051 [US12] Implement review form controller in `src/controllers/review_controller.js`

## Phase 15: User Story 13 (Reviewer Accept or Decline Invitation) [Priority P3]

**Story Goal**: Record reviewer invitation responses.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-04 in UC-13 suite pass.

- [ ] T052 [US13] Add invitation response logic in `src/services/review_service.js`
- [ ] T053 [US13] Build invitation response view in `src/views/reviewer_invitation.html`
- [ ] T054 [US13] Implement invitation response controller in `src/controllers/review_controller.js`

## Phase 16: User Story 14 (Submit Completed Review Form) [Priority P3]

**Story Goal**: Submit completed reviews with required fields.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-04 in UC-14 suite pass.

- [ ] T055 [US14] Add review submission logic in `src/services/review_service.js`
- [ ] T056 [US14] Update review form view for submit in `src/views/review_form.html`
- [ ] T057 [US14] Implement review submission controller in `src/controllers/review_controller.js`

## Phase 17: User Story 15 (Editor Receive Completed Review Forms) [Priority P3]

**Story Goal**: Provide editor access to completed review sets.  
**Independent Test Criteria**: UC15-AT-01 to UC15-AT-05 pass.

- [ ] T058 [US15] Add completed review retrieval in `src/services/review_service.js`
- [ ] T059 [US15] Build editor review summary view in `src/views/editor_reviews.html`
- [ ] T060 [US15] Implement editor review controller in `src/controllers/review_controller.js`

## Phase 18: User Story 16 (Make Final Paper Decision) [Priority P3]

**Story Goal**: Record final accept/reject decisions.  
**Independent Test Criteria**: UC16-AT-01 to UC16-AT-04 pass.

- [ ] T061 [US16] Create Decision model in `src/models/decision.js`
- [ ] T062 [US16] Add decision logic in `src/services/review_service.js`
- [ ] T063 [US16] Build decision view in `src/views/decision.html`
- [ ] T064 [US16] Implement decision controller in `src/controllers/review_controller.js`

## Phase 19: User Story 17 (Notify Author of Final Decision) [Priority P3]

**Story Goal**: Notify authors of accept/reject outcomes.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-04 in UC-17 suite pass.

- [ ] T065 [US17] Add author notification logic in `src/services/notification_service.js`
- [ ] T066 [US17] Build author notification view in `src/views/author_notification.html`
- [ ] T067 [US17] Implement notification controller in `src/controllers/notification_controller.js`

## Phase 20: User Story 18 (Generate Conference Schedule) [Priority P4]

**Story Goal**: Generate a draft schedule from accepted papers.  
**Independent Test Criteria**: UC15-AT-01 to UC15-AT-05 in UC-18 suite pass.

- [ ] T068 [US18] Create Schedule model in `src/models/schedule.js`
- [ ] T069 [US18] Implement schedule generation service in `src/services/schedule_service.js`
- [ ] T070 [US18] Build schedule preview view in `src/views/schedule_preview.html`
- [ ] T071 [US18] Implement schedule controller in `src/controllers/schedule_controller.js`

## Phase 21: User Story 19 (Edit Conference Schedule) [Priority P4]

**Story Goal**: Edit and validate draft schedules.  
**Independent Test Criteria**: UC16-AT-01 to UC16-AT-05 in UC-19 suite pass.

- [ ] T072 [US19] Add schedule edit validation in `src/services/schedule_service.js`
- [ ] T073 [US19] Build schedule edit view in `src/views/schedule_edit.html`
- [ ] T074 [US19] Implement schedule edit controller in `src/controllers/schedule_controller.js`

## Phase 22: User Story 20 (Publish Final Conference Schedule) [Priority P4]

**Story Goal**: Publish finalized schedule.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-05 in UC-20 suite pass.

- [ ] T075 [US20] Add schedule publish logic in `src/services/schedule_service.js`
- [ ] T076 [US20] Build schedule publish view in `src/views/schedule_publish.html`
- [ ] T077 [US20] Implement schedule publish controller in `src/controllers/schedule_controller.js`

## Phase 23: User Story 21 (Register for Conference and Pay) [Priority P5]

**Story Goal**: Register attendees and process payment.  
**Independent Test Criteria**: UC15-AT-01 to UC15-AT-04 in UC-21 suite pass.

- [ ] T078 [US21] Create Registration model in `src/models/registration.js`
- [ ] T079 [US21] Implement payment processing service in `src/services/payment_service.js`
- [ ] T080 [US21] Build registration/payment view in `src/views/registration.html`
- [ ] T081 [US21] Implement registration controller in `src/controllers/registration_controller.js`

## Phase 24: User Story 22 (Generate Registration Confirmation Ticket) [Priority P5]

**Story Goal**: Generate confirmation tickets after payment.  
**Independent Test Criteria**: UC16-AT-01 to UC16-AT-04 in UC-22 suite pass.

- [ ] T082 [US22] Create Ticket model in `src/models/ticket.js`
- [ ] T083 [US22] Implement ticket generation service in `src/services/ticket_service.js`
- [ ] T084 [US22] Build ticket display view in `src/views/ticket.html`
- [ ] T085 [US22] Implement ticket controller in `src/controllers/ticket_controller.js`

## Phase 25: User Story 23 (View Conference Pricing by Attendee Type) [Priority P5]

**Story Goal**: Show pricing categories prior to payment.  
**Independent Test Criteria**: UC06-AT-01 to UC06-AT-04 in UC-23 suite pass.

- [ ] T086 [US23] Create PricingCategory model in `src/models/pricing_category.js`
- [ ] T087 [US23] Implement pricing retrieval service in `src/services/pricing_service.js`
- [ ] T088 [US23] Build pricing view in `src/views/pricing.html`
- [ ] T089 [US23] Implement pricing controller in `src/controllers/pricing_controller.js`

## Phase 26: Polish & Cross-Cutting Concerns

- [ ] T090 Add role-based access checks in controllers (`src/controllers/*.js`)
- [ ] T091 Add error handling patterns for external service failures in `src/services/*.js`
- [ ] T092 Add sensitive-data redaction rules for error messages in authentication and payment flows (no credentials or payment details in UI errors) in `src/controllers/*.js` and `src/views/*.html`

## Dependencies (User Story Completion Order)

- US1 → US2 → US3 → US4 → US5 → US6 → US7 → US8 → US9 → US10 → US11 → US12 → US13 → US14 → US15 → US16 → US17 → US18 → US19 → US20 → US21 → US22 → US23

## Parallel Execution Examples

- **US1**: [P] T007 (model) and [P] T009 (view) can proceed in parallel.
- **US6**: [P] T028 (model) and [P] T030 (view) can proceed in parallel.
- **US10**: [P] T042 (model) and [P] T044 (view) can proceed in parallel.
- **US18**: [P] T068 (model) and [P] T070 (view) can proceed in parallel.
- **US21**: [P] T078 (model) and [P] T080 (view) can proceed in parallel.

## Task Completeness Validation

- Each user story has model, service, controller, and view tasks, plus routing updates where required.
- Each phase includes independent test criteria tied to acceptance tests.
- Shared concerns (auth, error handling) are handled in Polish phase.
