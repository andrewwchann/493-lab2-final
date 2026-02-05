---

description: "Task list for UC-01 Register Account implementation"
---

# Tasks: Register Account

**Input**: Design documents from `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-register-account/` and authoritative
use cases in `use_cases/` plus acceptance tests in `acceptance_tests/`.
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in the feature specification; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story, and every task is traceable to
UC-01 use case steps or acceptance tests.

## Constitution Check

- Scope limited to UC-01 and UC01-AT-01 through UC01-AT-07. PASS.
- Tasks traceable to `use_cases/UC-01_Register_Account.md` and `acceptance_tests/UC-01_Acceptance_Test_Suite.md`. PASS.
- MVC separation respected in task file paths and responsibilities. PASS.
- Vanilla HTML/CSS/JS constraints preserved. PASS.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Include UC-01 and acceptance test references in each task description

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create MVC directories `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers`, `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models`, `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/views`, `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/public/css`, `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/public/js` (UC-01)
- [ ] T002 [P] Create registration stylesheet placeholder `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/public/css/register.css` (UC-01)
- [ ] T003 [P] Create registration script placeholder `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/public/js/register.js` (UC-01)
- [ ] T004 Create route map file `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/routes.js` with placeholder for the `/register` route (UC-01)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create user account model in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/userAccount.js` with fields and constraints from data-model.md (UC-01, UC01-AT-01)
- [ ] T006 [P] Create user store interface in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/userStore.js` with create and duplicate-email lookup operations (UC-01, UC01-AT-01, UC01-AT-03)
- [ ] T007 Create validators module in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/validators.js` with required-field checks for name, email, and password (UC-01, UC01-AT-06)
- [ ] T008 Extend `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/validators.js` with email format validation rules (UC-01, UC01-AT-02)
- [ ] T009 Extend `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/validators.js` with password validation per UC-01 and UC01-AT-04 (UC-01, UC01-AT-04)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Register a New Account (Priority: P1) 🎯 MVP

**Goal**: Guest user can submit valid registration data, create an account, and be redirected to login.

**Independent Test**: Submit valid data per UC01-AT-01 and confirm account creation and redirect to `/login`.

### Implementation for User Story 1

- [ ] T010 [US1] Create registration form view `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/views/register.html` with name, email, password fields and submit action to `/register` (UC-01, UC01-AT-01, UC01-AT-06)
- [ ] T011 [US1] Implement GET `/register` handler in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` to render the form (UC-01)
- [ ] T012 [US1] Implement POST success path in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` to create account via `userStore` and redirect to `/login` when validation passes (UC-01, UC01-AT-01)
- [ ] T013 [US1] Wire `/register` GET/POST routes to `registerController` in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/routes.js` (UC-01)

**Checkpoint**: User Story 1 should be functional and independently testable

---

## Phase 4: User Story 2 - Handle Invalid Registration Inputs (Priority: P2)

**Goal**: Invalid inputs are rejected with field-level errors and no account is created.

**Independent Test**: Execute UC01-AT-02 through UC01-AT-06 and confirm rejection and field-level errors.

### Implementation for User Story 2

- [ ] T014 [US2] Add validation failure handling in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` for invalid email, weak password, and missing fields (UC01-AT-02, UC01-AT-04, UC01-AT-06)
- [ ] T015 [US2] Implement duplicate email check in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/models/userStore.js` and surface duplicate email field error in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` (UC01-AT-03)
- [ ] T016 [US2] Ensure `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` aggregates multiple field errors without short-circuiting (UC01-AT-05)
- [ ] T017 [US2] Update `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/views/register.html` to display field-level errors for each invalid field (UC01-AT-02, UC01-AT-03, UC01-AT-04, UC01-AT-05, UC01-AT-06)

**Checkpoint**: User Stories 1 and 2 should be independently functional

---

## Phase 5: User Story 3 - Correct Errors and Resubmit (Priority: P3)

**Goal**: Users can correct errors and successfully register on a subsequent attempt.

**Independent Test**: Execute UC01-AT-07 from a failed submission to successful registration and redirect.

### Implementation for User Story 3

- [ ] T018 [US3] Ensure resubmitted valid data clears prior errors and follows the success redirect path in `/home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js` (UC01-AT-07)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation alignment and contract consistency

- [ ] T019 Update `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-register-account/quickstart.md` if implementation details require adjustments (UC-01)
- [ ] T020 Validate `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-register-account/contracts/registration-openapi.yaml` matches implemented registration behavior and field-level error responses (UC-01)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel if staffed
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); depends on US1 components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2); depends on US2 error handling flow

### Within Each User Story

- Models before controllers
- Controllers before views
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002 and T003 can run in parallel after T001
- T005 and T006 can run in parallel after Phase 1
- User Story 1 tasks can run after Phase 2; User Story 2 and 3 can follow once their dependencies are complete

---

## Parallel Example: User Story 1

```bash
Task: "Create registration form view in /home/ajchan/ECE493/lab/lab2/493-lab2-final/src/views/register.html"
Task: "Implement GET /register handler in /home/ajchan/ECE493/lab/lab2/493-lab2-final/src/controllers/registerController.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently against UC01-AT-01

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Validate UC01-AT-01
3. Add User Story 2 → Validate UC01-AT-02 through UC01-AT-06
4. Add User Story 3 → Validate UC01-AT-07

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid cross-story dependencies that break independence
