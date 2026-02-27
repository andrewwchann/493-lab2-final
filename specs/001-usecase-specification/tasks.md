---

description: "Task list for Use Case Specification Expansion implementation"
---

# Tasks: Use Case Specification Expansion

**Input**: Design documents from `/specs/001-usecase-specification/` and authoritative use cases in `use_cases/` plus acceptance tests in `acceptance_tests/`.
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test-authoring tasks are included; acceptance validation and readiness tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Every task includes UC-XX and acceptance test suite references.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions
- Include UC-XX and acceptance test references in each task description
- Trace format for all new tasks: `Trace: UC-XX step N; AT: UCXX-AT-YY`

## Constitution Check

- Use-case-only scope preserved; no tasks beyond UC-01 to UC-23 and acceptance tests. **PASS**
- All tasks traceable to specific use case steps or acceptance tests. **PASS**
- MVC separation respected: models, views, controllers, services scoped accordingly. **PASS**
- Vanilla HTML/CSS/JS only; no frameworks or CSS libraries. **PASS**

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create MVC directories per plan in `src/models/`, `src/controllers/`, `src/views/`, `src/services/`, `src/assets/` (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01)
- [X] T002 Create local acceptance test workspace directory `tests/acceptance/` for running UC suites (authoritative tests remain in `acceptance_tests/`) (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01)
- [X] T003 [P] Add project README update for MVC layout in `README.md` to align setup steps with UC01/03/06 test flows (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01)
- [X] T004 [P] Add base static assets placeholder in `src/assets/.keep` to support public schedule assets referenced by UC-20 publication flow (Trace: UC-20 step 7; AT: UC06-AT-01 in UC-20 suite)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that must be complete before user stories

- [X] T005 Create router skeleton in `src/controllers/router.js` with route registration hooks (Trace: UC-01 step 1, UC-03 step 1, UC-06 step 1, UC-20 step 1; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01, UC06-AT-01 in UC-20 suite)
- [X] T006 Create shared view helper utilities in `src/views/helpers.js` (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2, UC-12 step 3; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01, UC06-AT-01 in UC-12 suite)
- [X] T007 Create base data store interface in `src/services/data_store.js` (Trace: UC-01 step 6, UC-06 step 6, UC-15 step 3, UC-21 step 9, UC-22 step 5; AT: UC01-AT-01, UC06-AT-01, UC15-AT-01, UC15-AT-01 in UC-21 suite, UC16-AT-01 in UC-22 suite)
- [X] T008 Create session/auth base service in `src/services/session_service.js` for session create/lookup (Trace: UC-03 step 7; AT: UC03-AT-01)
- [X] T009 Create role access helper in `src/services/access_control.js` to enforce authorized user rules (Trace: NFR-001, UC-03 step 8, UC-05 step 5, UC-21 step 1; AT: UC03-AT-01, UC05-AT-01, UC05-AT-02, UC15-AT-01, UC15-AT-03 in UC-21 suite)
- [X] T010 [P] Create controller guard helper in `src/controllers/guard.js` for role checks (Trace: NFR-001, UC-03 step 8, UC-05 step 5, UC-21 step 1; AT: UC03-AT-01, UC05-AT-01, UC05-AT-02, UC15-AT-01, UC15-AT-03 in UC-21 suite)
- [X] T011 [P] Create route role map in `src/controllers/route_roles.js` for protected routes (Trace: NFR-001, UC-03 step 8, UC-05 step 5, UC-21 step 1; AT: UC03-AT-01, UC05-AT-01, UC05-AT-02, UC15-AT-01, UC15-AT-03 in UC-21 suite)
- [X] T012 Integrate guard and role map into `src/controllers/router.js` for protected routes (Trace: NFR-001, UC-03 step 8, UC-05 step 5, UC-21 step 1; AT: UC03-AT-01, UC05-AT-01, UC05-AT-02, UC15-AT-01, UC15-AT-03 in UC-21 suite)
- [X] T013 [P] Create file upload adapter stub in `src/services/file_upload_service.js` (Trace: UC-06, UC-07, UC-08; AT: UC-06/07/08 suites)
- [X] T014 [P] Create notification adapter stub in `src/services/notification_service.js` (Trace: UC-10, UC-13, UC-17, UC-20; AT: UC-10/13/17/20 suites)
- [X] T015 [P] Create payment gateway adapter stub in `src/services/payment_gateway_service.js` (Trace: UC-21, UC-22; AT: UC-21/22 suites)
- [X] T016 [P] Create public website publication adapter in `src/services/publication_service.js` (Trace: UC-20; AT: UC-20 suite)
- [X] T017 [P] Create ticketing adapter stub in `src/services/ticket_service.js` (Trace: UC-22; AT: UC-22 suite)
- [X] T018 Create shared error policy helper in `src/services/error_policy.js` for redaction and safe-fail messages (Trace: NFR-002, NFR-003, UC-03, UC-05, UC-21; AT: UC-03/05/21 suites)

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Register Account (Priority: P1) 🎯 MVP

**Goal**: Register a new CMS account and redirect to login on success.
**Independent Test**: Complete registration and verify redirect to login without other CMS features.

- [X] T019 [P] [US1] Create Account model in `src/models/account.js` (Trace: UC-01; AT: UC-01 suite)
- [X] T020 [US1] Implement registration validation/persistence in `src/services/registration_service.js` including required-field enforcement and redirect to login on success (Trace: UC-01; AT: UC-01 suite)
- [X] T021 [P] [US1] Build registration form view in `src/views/register.html` (Trace: UC-01; AT: UC-01 suite)
- [X] T022 [US1] Implement registration controller in `src/controllers/register_controller.js` (Trace: UC-01; AT: UC-01 suite)
- [X] T023 [US1] Wire registration route in `src/controllers/router.js` as public (Trace: UC-01; AT: UC-01 suite)

---

## Phase 4: User Story 2 - Validate Registration Credentials (Priority: P1)

**Goal**: Validate registration email/password before account creation.
**Independent Test**: Submit valid and invalid credentials on the registration form.

- [X] T024 [US2] Add email format/uniqueness validation in `src/services/registration_service.js` (Trace: UC-02; AT: UC-02 suite)
- [X] T025 [US2] Add password validation per acceptance tests in `src/services/registration_service.js` (Trace: UC-02; AT: UC-02 suite)
- [X] T026 [US2] Add validation error rendering in `src/views/register.html` (Trace: UC-02; AT: UC-02 suite)

---

## Phase 5: User Story 3 - Log In to CMS (Priority: P1)

**Goal**: Authenticate a registered user and show role-based dashboard.
**Independent Test**: Log in with valid and invalid credentials.

- [X] T027 [P] [US3] Create Session model in `src/models/session.js` (Trace: UC-03; AT: UC-03 suite)
- [X] T028 [US3] Implement authentication flow in `src/services/auth_service.js` using email/username identifier (Trace: UC-03, UC-05; AT: UC-03 suite)
- [X] T029 [P] [US3] Build login form view in `src/views/login.html` (Trace: UC-03; AT: UC-03 suite)
- [X] T030 [P] [US3] Build role-based dashboard view stubs in `src/views/dashboard.html` (Trace: UC-03; AT: UC-03 suite)
- [X] T031 [US3] Implement login controller in `src/controllers/login_controller.js` (Trace: UC-03; AT: UC-03 suite)
- [X] T032 [US3] Wire login and dashboard routes in `src/controllers/router.js` with role guard on dashboards (Trace: UC-03; AT: UC-03 suite)
- [X] T033 [US3] Add required-field validation for login submissions in `src/services/auth_service.js` (Trace: UC-03, UC-05; AT: UC-03 suite)
- [X] T034 [US3] Render missing-field errors in `src/views/login.html` (Trace: UC-03, UC-05; AT: UC-03 suite)
- [X] T035 [US3] Add auth-service-unavailable handling with retry-later error in `src/services/auth_service.js` (Trace: UC-03; AT: UC-03 suite)
- [X] T036 [US3] Render retry-later errors in `src/views/login.html` (Trace: UC-03; AT: UC-03 suite)
- [X] T037 [US3] Update login controller to map validation/service errors to view in `src/controllers/login_controller.js` (Trace: UC-03, UC-05; AT: UC-03 suite)

---

## Phase 6: User Story 4 - Change Account Password (Priority: P1)

**Goal**: Allow authenticated users to change passwords.
**Independent Test**: Change password and then log in with new password.

- [X] T038 [US4] Add password change logic in `src/services/auth_service.js` (Trace: UC-04; AT: UC-04 suite)
- [X] T039 [P] [US4] Build change password view in `src/views/change_password.html` (Trace: UC-04; AT: UC-04 suite)
- [X] T040 [US4] Implement change password controller in `src/controllers/password_controller.js` (Trace: UC-04; AT: UC-04 suite)
- [X] T041 [US4] Wire change password route in `src/controllers/router.js` with role guard (Trace: UC-04; AT: UC-04 suite)

---

## Phase 7: User Story 5 - Handle Login Failure (Priority: P1)

**Goal**: Deny invalid logins with clear errors.
**Independent Test**: Attempt login with invalid credentials and observe error feedback.

- [X] T042 [US5] Add login failure messaging in `src/views/login.html` (Trace: UC-05; AT: UC-05 suite)
- [X] T043 [US5] Update auth failure handling in `src/services/auth_service.js` (Trace: UC-05; AT: UC-05 suite)
- [X] T044 [US5] Update login controller error flow in `src/controllers/login_controller.js` (Trace: UC-05; AT: UC-05 suite)

---

## Phase 8: User Story 6 - Submit Paper Manuscript (Priority: P2)

**Goal**: Submit a paper with required metadata and manuscript file.
**Independent Test**: Submit valid paper and verify it is marked Submitted.

- [X] T045 [P] [US6] Create Submission model in `src/models/submission.js` (Trace: UC-06; AT: UC-06 suite)
- [X] T046 [P] [US6] Create Manuscript model in `src/models/manuscript.js` (Trace: UC-06; AT: UC-06 suite)
- [X] T047 [US6] Implement submission create flow in `src/services/submission_service.js` (Trace: UC-06; AT: UC-06 suite)
- [X] T048 [US6] Enforce submission window open for final submission in `src/services/submission_service.js` (Trace: UC-06, UC-09; AT: UC-09 suite)
- [X] T049 [P] [US6] Build submission form view in `src/views/submit_paper.html` (Trace: UC-06; AT: UC-06 suite)
- [X] T050 [US6] Display submission-window-closed error in `src/views/submit_paper.html` (Trace: UC-09; AT: UC-09 suite)
- [X] T051 [US6] Implement submission controller in `src/controllers/submission_controller.js` (Trace: UC-06; AT: UC-06 suite)
- [X] T052 [US6] Wire submission route in `src/controllers/router.js` with role guard (Trace: UC-06; AT: UC-06 suite)

---

## Phase 9: User Story 7 - Update Submitted Paper Manuscript (Priority: P2)

**Goal**: Replace an existing manuscript while preserving the submission record.
**Independent Test**: Replace manuscript and verify prior version is preserved on failure.

- [X] T053 [US7] Add manuscript replacement logic in `src/services/submission_service.js` retaining prior manuscript on failure (Trace: UC-07; AT: UC-07 suite)
- [X] T054 [P] [US7] Build update manuscript view in `src/views/update_manuscript.html` (Trace: UC-07; AT: UC-07 suite)
- [X] T055 [US7] Update submission controller for replace flow in `src/controllers/submission_controller.js` (Trace: UC-07; AT: UC-07 suite)
- [X] T056 [US7] Wire manuscript replace route in `src/controllers/router.js` with role guard (Trace: UC-07; AT: UC-07 suite)

---

## Phase 10: User Story 8 - Validate Paper Submission Fields (Priority: P2)

**Goal**: Block incomplete or invalid submissions.
**Independent Test**: Submit papers with missing fields or invalid files.

- [X] T057 [US8] Add submission validation rules in `src/services/submission_service.js` including required metadata, manuscript format (`.pdf`, `.doc`, `.docx`, `.tex`, `.zip` LaTeX bundle), and max size 7.0MB for submit/update (Trace: UC-08; AT: UC-08 suite)
- [X] T058 [US8] Add validation error display in `src/views/submit_paper.html` (Trace: UC-08; AT: UC-08 suite)
- [X] T059 [US8] Update submission controller validation flow in `src/controllers/submission_controller.js` (Trace: UC-08; AT: UC-08 suite)

---

## Phase 11: User Story 9 - Save Submission Progress (Priority: P2)

**Goal**: Save and resume draft submissions.
**Independent Test**: Save a draft and resume it later.

- [X] T060 [US9] Add draft save/resume logic in `src/services/submission_service.js` (Trace: UC-09; AT: UC-09 suite)
- [X] T061 [US9] Enforce minimum draft fields (at least title or identifier) and reject save in `src/services/submission_service.js` (Trace: UC-09; AT: UC-09 suite)
- [X] T062 [US9] Block draft-to-submit when submission window closed and keep draft view-only accessible in `src/services/submission_service.js` (Trace: UC-09; AT: UC-09 suite)
- [X] T063 [P] [US9] Build draft list view in `src/views/draft_list.html` (Trace: UC-09; AT: UC-09 suite)
- [X] T064 [US9] Surface draft-save and window-closed errors in `src/views/draft_list.html` (Trace: UC-09; AT: UC-09 suite)
- [X] T065 [US9] Update submission controller for draft flows in `src/controllers/submission_controller.js` (Trace: UC-09; AT: UC-09 suite)
- [X] T066 [US9] Wire draft list/resume routes in `src/controllers/router.js` with role guard (Trace: UC-09; AT: UC-09 suite)

---

## Phase 12: User Story 10 - Assign Reviewers to Paper (Priority: P3)

**Goal**: Assign exactly three reviewers with workload limits and send invitations.
**Independent Test**: Assign reviewers and verify invitation delivery.

- [X] T067 [P] [US10] Create ReviewAssignment model in `src/models/review_assignment.js` (Trace: UC-10; AT: UC-10 suite)
- [X] T068 [US10] Implement reviewer assignment logic in `src/services/review_service.js` enforcing exactly 3 reviewers, reviewer existence, and max workload of 5 assignments; send invitations (Trace: UC-10; AT: UC-10 suite)
- [X] T069 [P] [US10] Build reviewer assignment view in `src/views/assign_reviewers.html` (Trace: UC-10; AT: UC-10 suite)
- [X] T070 [US10] Implement reviewer assignment controller in `src/controllers/review_controller.js` (Trace: UC-10; AT: UC-10 suite)
- [X] T071 [US10] Wire reviewer assignment route in `src/controllers/router.js` with role guard (Trace: UC-10; AT: UC-10 suite)

---

## Phase 13: User Story 13 - Reviewer Accept or Decline Invitation (Priority: P3)

**Goal**: Record reviewer invitation responses and notify editor.
**Independent Test**: Respond to invitation and verify editor notification.

- [X] T085 [US13] Add invitation response logic in `src/services/review_service.js` (Trace: UC-13; AT: UC-13 suite)
- [X] T086 [P] [US13] Build invitation response view in `src/views/reviewer_invitation.html` showing paper title, abstract, and review deadline (Trace: UC-13; AT: UC-13 suite)
- [X] T087 [US13] Update review controller for invitation responses in `src/controllers/review_controller.js` (Trace: UC-13; AT: UC-13 suite)
- [X] T088 [US13] Wire invitation response route in `src/controllers/router.js` with role guard (Trace: UC-13; AT: UC-13 suite)

---

## Phase 14: User Story 11 - Reviewer View Accepted Assigned Papers (Priority: P3)

**Goal**: List accepted assigned papers for reviewers.
**Independent Test**: Accept and decline invitations and verify the list.

- [X] T072 [US11] Add accepted assignment retrieval in `src/services/review_service.js` (Trace: UC-11; AT: UC-11 suite)
- [X] T073 [P] [US11] Build reviewer assignments view in `src/views/reviewer_assignments.html` showing title, abstract summary, review deadline, and access link (Trace: UC-11; AT: UC-11 suite)
- [X] T074 [US11] Update review controller for reviewer dashboard in `src/controllers/review_controller.js` (Trace: UC-11; AT: UC-11 suite)
- [X] T075 [US11] Wire reviewer assignments route in `src/controllers/router.js` with role guard (Trace: UC-11; AT: UC-11 suite)

---

## Phase 15: User Story 12 - Reviewer Access Review Form (Priority: P3)

**Goal**: Allow accepted reviewers to open review forms.
**Independent Test**: Accept assignment and open review form.

- [X] T076 [P] [US12] Create ReviewForm model in `src/models/review_form.js` (Trace: UC-12; AT: UC-12 suite)
- [X] T077 [US12] Add review form access logic in `src/services/review_service.js` enforcing accepted invitation and review deadline gating with clear errors (Trace: UC-12; AT: UC-12 suite)
- [X] T078 [US12] Add review-form draft save logic in `src/services/review_service.js` (Trace: UC-12 step 9; AT: UC-12 suite)
- [X] T079 [US12] Add "Save Progress" UI in `src/views/review_form.html` (Trace: UC-12 step 9; AT: UC-12 suite)
- [X] T080 [US12] Handle save-progress action in `src/controllers/review_controller.js` (Trace: UC-12 step 9; AT: UC-12 suite)
- [X] T081 [US12] Wire review save-progress route in `src/controllers/router.js` with role guard (Trace: UC-12 step 9; AT: UC-12 suite)
- [X] T082 [P] [US12] Build review form view with required fields in `src/views/review_form.html` (Trace: UC-12; AT: UC-12 suite)
- [X] T083 [US12] Update review controller to render form access in `src/controllers/review_controller.js` (Trace: UC-12; AT: UC-12 suite)
- [X] T084 [US12] Wire review form access route in `src/controllers/router.js` with role guard (Trace: UC-12; AT: UC-12 suite)

---

## Phase 16: User Story 14 - Submit Completed Review Form (Priority: P3)

**Goal**: Submit completed reviews with required fields before deadline.
**Independent Test**: Submit a complete review and verify editor access.

- [X] T089 [US14] Add review submission validation in `src/services/review_service.js` enforcing required fields and deadline (block late submissions) (Trace: UC-14; AT: UC-14 suite)
- [X] T090 [US14] Update review form view for submit errors in `src/views/review_form.html` (Trace: UC-14; AT: UC-14 suite)
- [X] T091 [US14] Update review controller to handle submission in `src/controllers/review_controller.js` (Trace: UC-14; AT: UC-14 suite)
- [X] T092 [US14] Wire review submission route in `src/controllers/router.js` with role guard (Trace: UC-14; AT: UC-14 suite)

---

## Phase 17: User Story 15 - Editor Receive Completed Review Forms (Priority: P3)

**Goal**: Provide editor access to completed review sets once all three submitted.
**Independent Test**: Complete three reviews and verify editor access.

- [X] T093 [US15] Add completed review retrieval in `src/services/review_service.js` gated on exactly three reviews; expose full review set to editor even if notifications fail (Trace: UC-15; AT: UC-15 suite)
- [X] T143 [US15] Persist paper status transition from Under Review to Reviews Complete exactly when the third valid review is submitted in `src/services/review_service.js` (Trace: UC-15 step 3; AT: UC15-AT-01, UC15-AT-02)
- [X] T094 [P] [US15] Build editor review summary view in `src/views/editor_reviews.html` (Trace: UC-15; AT: UC-15 suite)
- [X] T095 [US15] Update review controller for editor review access in `src/controllers/review_controller.js` (Trace: UC-15; AT: UC-15 suite)
- [X] T096 [US15] Wire editor review summary route in `src/controllers/router.js` with role guard (Trace: UC-15; AT: UC-15 suite)

---

## Phase 18: User Story 16 - Make Final Paper Decision (Priority: P3)

**Goal**: Record final accept/reject decisions after three reviews.
**Independent Test**: Make decision after three reviews are complete.

- [X] T097 [P] [US16] Create ReviewDecision model in `src/models/decision.js` (Trace: UC-16; AT: UC-16 suite)
- [X] T098 [US16] Add decision logic in `src/services/review_service.js` (Trace: UC-16; AT: UC-16 suite)
- [X] T099 [P] [US16] Build decision view in `src/views/decision.html` (Trace: UC-16; AT: UC-16 suite)
- [X] T100 [US16] Update review controller for decision submission in `src/controllers/review_controller.js` (Trace: UC-16; AT: UC-16 suite)
- [X] T101 [US16] Wire decision submission route in `src/controllers/router.js` with role guard (Trace: UC-16; AT: UC-16 suite)

---

## Phase 19: User Story 17 - Notify Author of Final Decision (Priority: P3)

**Goal**: Notify authors of accept/reject outcomes.
**Independent Test**: Issue decision and verify author notification.

- [X] T102 [US17] Add author notification flow in `src/services/notification_service.js` ensuring dashboard visibility even if email delivery fails (Trace: UC-17; AT: UC-17 suite)
- [X] T103 [P] [US17] Build author notification view in `src/views/author_notification.html` (Trace: UC-17; AT: UC-17 suite)
- [X] T104 [US17] Implement notification controller in `src/controllers/notification_controller.js` (Trace: UC-17; AT: UC-17 suite)
- [X] T105 [US17] Wire author notification route in `src/controllers/router.js` with role guard (Trace: UC-17; AT: UC-17 suite)

---

## Phase 20: User Story 18 - Generate Conference Schedule (Priority: P4)

**Goal**: Generate a draft schedule from accepted papers.
**Independent Test**: Generate schedule when accepted papers exist.

- [X] T106 [P] [US18] Create Schedule model in `src/models/schedule.js` (Trace: UC-18; AT: UC-18 suite)
- [X] T107 [P] [US18] Create ScheduleItem model in `src/models/schedule_item.js` (Trace: UC-18; AT: UC-18 suite)
- [X] T108 [US18] Implement schedule generation in `src/services/schedule_service.js` (Trace: UC-18; AT: UC-18 suite)
- [X] T109 [P] [US18] Build schedule preview view in `src/views/schedule_preview.html` (Trace: UC-18; AT: UC-18 suite)
- [X] T110 [US18] Implement schedule controller for draft generation in `src/controllers/schedule_controller.js` (Trace: UC-18; AT: UC-18 suite)
- [X] T111 [US18] Wire schedule generation route in `src/controllers/router.js` with role guard (Trace: UC-18; AT: UC-18 suite)

---

## Phase 21: User Story 19 - Edit Conference Schedule (Priority: P4)

**Goal**: Edit and validate draft schedules.
**Independent Test**: Apply edits and verify conflict prevention.

- [X] T112 [US19] Add schedule edit validation in `src/services/schedule_service.js` (Trace: UC-19; AT: UC-19 suite)
- [X] T113 [P] [US19] Build schedule edit view in `src/views/schedule_edit.html` (Trace: UC-19; AT: UC-19 suite)
- [X] T114 [US19] Update schedule controller for edit/save in `src/controllers/schedule_controller.js` (Trace: UC-19; AT: UC-19 suite)
- [X] T115 [US19] Wire schedule edit route in `src/controllers/router.js` with role guard (Trace: UC-19; AT: UC-19 suite)

---

## Phase 22: User Story 20 - Publish Final Conference Schedule (Priority: P4)

**Goal**: Publish finalized schedule and make it publicly accessible.
**Independent Test**: Publish finalized draft and verify public visibility.

- [X] T116 [US20] Add schedule publish logic in `src/services/schedule_service.js` including confirmation requirement and failure handling (keep draft if publish fails) (Trace: UC-20; AT: UC-20 suite)
- [X] T117 [P] [US20] Build schedule publish view in `src/views/schedule_publish.html` (Trace: UC-20; AT: UC-20 suite)
- [X] T118 [P] [US20] Build public schedule view in `src/views/public_schedule.html` (Trace: UC-20; AT: UC-20 suite)
- [X] T119 [US20] Log notification failure without blocking publication in `src/services/notification_service.js` (Trace: UC-20; AT: UC-20 suite)
- [X] T120 [US20] Update schedule controller to surface non-blocking notification warnings in `src/controllers/schedule_controller.js` (Trace: UC-20; AT: UC-20 suite)
- [X] T121 [US20] Wire schedule publish and public schedule routes in `src/controllers/router.js` with role guard on editor routes, ensuring publish confirmation flow and failure messaging surfaced (Trace: UC-20; AT: UC-20 suite)

---

## Phase 23: User Story 23 - View Conference Pricing by Attendee Type (Priority: P5)

**Goal**: Show pricing categories prior to payment.
**Independent Test**: View pricing and select a valid category.

- [X] T133 [P] [US23] Create PricingCategory model in `src/models/pricing_category.js` (Trace: UC-23; AT: UC-23 suite)
- [X] T134 [US23] Implement pricing retrieval in `src/services/pricing_service.js` (Trace: UC-23; AT: UC-23 suite)
- [X] T135 [P] [US23] Build pricing view in `src/views/pricing.html` (Trace: UC-23; AT: UC-23 suite)
- [X] T136 [US23] Implement pricing controller in `src/controllers/pricing_controller.js` (Trace: UC-23; AT: UC-23 suite)
- [X] T137 [US23] Wire pricing view route in `src/controllers/router.js` as public (Trace: UC-23; AT: UC-23 suite)

---

## Phase 24: User Story 21 - Register for Conference and Pay (Priority: P5)

**Goal**: Register attendees and process payment.
**Independent Test**: Complete payment and receive confirmation.

- [X] T122 [P] [US21] Create Registration model in `src/models/registration.js` (Trace: UC-21; AT: UC-21 suite)
- [X] T123 [P] [US21] Create PaymentTransaction model in `src/models/payment_transaction.js` (Trace: UC-21; AT: UC-21 suite)
- [X] T124 [US21] Implement payment processing flow including decline handling in `src/services/payment_service.js` (Trace: UC-21; AT: UC-21 suite)
- [X] T125 [P] [US21] Build registration/payment view in `src/views/registration.html` (Trace: UC-21; AT: UC-21 suite)
- [X] T126 [US21] Implement registration controller in `src/controllers/registration_controller.js` (Trace: UC-21; AT: UC-21 suite)
- [X] T127 [US21] Wire registration/payment route in `src/controllers/router.js` as public while keeping registration records protected by role checks in data-access paths (Trace: UC-21 step 1; AT: UC15-AT-01, UC15-AT-03 in UC-21 suite)

---

## Phase 25: User Story 22 - Generate Registration Confirmation Ticket (Priority: P5)

**Goal**: Generate confirmation tickets after payment.
**Independent Test**: Complete payment and verify ticket availability.

- [X] T128 [P] [US22] Create Ticket model in `src/models/ticket.js` (Trace: UC-22; AT: UC-22 suite)
- [X] T129 [US22] Implement ticket generation logic with delayed ticket on failure in `src/services/ticket_service.js` (Trace: UC-22; AT: UC-22 suite)
- [X] T144 [US22] Implement payment -> registration -> ticket orchestration in `src/services/payment_service.js` and `src/services/ticket_service.js` so registration remains confirmed when ticket generation fails and ticket state is delayed with user notice (Trace: UC-22 step 3, UC-21 step 9; AT: UC16-AT-02 in UC-22 suite, UC15-AT-04 in UC-21 suite)
- [X] T130 [P] [US22] Build ticket display view in `src/views/ticket.html` (Trace: UC-22; AT: UC-22 suite)
- [X] T131 [US22] Implement ticket controller in `src/controllers/ticket_controller.js` (Trace: UC-22; AT: UC-22 suite)
- [X] T132 [US22] Wire ticket route in `src/controllers/router.js` with role guard (Trace: UC-22; AT: UC-22 suite)

---

## Phase 26: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T138 [P] Audit and redact sensitive data in error paths within `src/controllers/` and `src/views/` (Trace: NFR-002, UC-03, UC-05, UC-21; AT: UC-03/05/21 suites)
- [X] T139 Ensure external service failure handling follows safe-fail policy in `src/services/*_service.js` (Trace: NFR-003, UC-03, UC-06, UC-07, UC-14, UC-21; AT: UC-03/06/07/14/21 suites)
- [X] T140 [P] Update documentation notes in `specs/001-usecase-specification/quickstart.md` if implementation notes change to keep UC01/03/06 setup aligned with acceptance tests (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01)
- [X] T141 Run quickstart validation steps in `specs/001-usecase-specification/quickstart.md` to confirm UC01/03/06 acceptance test setup readiness (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2; AT: UC01-AT-01, UC03-AT-01, UC06-AT-01)
- [X] T142 [P] Verify task-to-spec traceability in `specs/001-usecase-specification/tasks.md` for UC-01/03/06 mappings to confirm acceptance test coverage (Trace: UC-01 step 2, UC-03 step 2, UC-06 step 2)
- [X] T145 Execute and record UC-01 and UC-02 acceptance results for SC-001 in `tests/acceptance/results/sc-001.md` (Trace: UC-01, UC-02; AT: UC01-AT-01 to UC01-AT-07, UC02-AT-01 to UC02-AT-07)
- [X] T146 Execute and record UC-03 and UC-05 acceptance results for SC-002 in `tests/acceptance/results/sc-002.md` (Trace: UC-03, UC-05; AT: UC03-AT-01 to UC03-AT-05, UC05-AT-01 to UC05-AT-04)
- [X] T147 Execute and record UC-04 acceptance results for SC-003 in `tests/acceptance/results/sc-003.md` (Trace: UC-04; AT: UC04-AT-01 to UC04-AT-05)
- [X] T148 Execute and record UC-06 to UC-09 acceptance results for SC-004 in `tests/acceptance/results/sc-004.md` (Trace: UC-06 step 1, UC-07 step 1, UC-08 step 1, UC-09 step 1; AT: UC-06 to UC-09 suites)
- [X] T149 Execute and record UC-10 to UC-14 acceptance results for SC-005 in `tests/acceptance/results/sc-005.md` (Trace: UC-10 step 1, UC-11 step 1, UC-12 step 1, UC-13 step 1, UC-14 step 1; AT: UC-10 to UC-14 suites)
- [X] T150 Execute and record UC-15 to UC-17 acceptance results for SC-006 in `tests/acceptance/results/sc-006.md` (Trace: UC-15 step 1, UC-16 step 1, UC-17 step 1; AT: UC-15 to UC-17 suites)
- [X] T151 Execute and record UC-18 to UC-20 acceptance results for SC-007 in `tests/acceptance/results/sc-007.md` (Trace: UC-18 step 1, UC-19 step 1, UC-20 step 1; AT: UC-18 to UC-20 suites)
- [X] T152 Execute and record UC-21 to UC-23 acceptance results for SC-008 in `tests/acceptance/results/sc-008.md` (Trace: UC-21 step 1, UC-22 step 1, UC-23 step 1; AT: UC-21 to UC-23 suites)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 26)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 to US5 (P1)**: Can start after Foundational; may share Account/Session services
- **US6 to US9 (P2)**: Depend on authentication foundation; otherwise independent
- **US10 to US17 (P3)**: Depend on submission entities and reviewer assignments
- **US18 to US20 (P4)**: Depend on decisions/accepted papers
- **US21 to US23 (P5)**: Depend on pricing data availability and payment adapter
- **US11 and US12**: Depend on US13 (accepted assignments exist only after invitation response)
- **US21**: Depends on US23 (pricing must be available before registration/payment)
- **US22**: Depends on US21 (ticket generation requires completed payment/registration)

### Parallel Opportunities (Examples)

- US1: T019 and T021 can run in parallel (model vs view)
- US3: T027 and T029 can run in parallel (model vs view)
- US6: T045 and T049 can run in parallel (model vs view)
- US10: T067 and T069 can run in parallel (model vs view)
- US18: T106 and T109 can run in parallel (model vs view)
- US21: T122 and T125 can run in parallel (model vs view)

---

## Implementation Strategy

Deliver an MVP by completing **User Story 1** end-to-end, then proceed in
priority order (P1 → P5). Shared models/services are introduced in the earliest
story that needs them, and each story is independently testable against its
acceptance suite.
