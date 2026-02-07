# Implementation Plan: Use Case Specification Expansion

**Branch**: `001-usecase-specification` | **Date**: February 6, 2026 | **Spec**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md
**Input**: Feature specification from /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md.
Authoritative use cases and acceptance tests remain the source of truth.

**Note**: This plan complies with /home/ajchan/ECE493/lab/lab2/493-lab2-final/.specify/memory/constitution.md.

## Summary

Update the CMS implementation plan so every UC-01 through UC-23 flow step,
extension, and acceptance scenario is explicitly represented as task seeds.
The plan incorporates new clarifications (authorized user, role-based
dashboard, review form fields, optional schedule notifications, UC-18/UC-20
publication relationship, required data fields summary, and out-of-scope NFRs)
while preserving MVC separation and a vanilla HTML/CSS/JS stack. External
integrations (auth, data store, file upload, notification, payment, public
website, ticketing) are modeled via explicit contracts to avoid assumptions.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+) - vanilla only
**Primary Dependencies**: None (no frontend or CSS frameworks permitted)
**Storage**: CMS database (technology unspecified in use cases)
**Testing**: Acceptance tests in /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/
**Target Platform**: Modern web browsers
**Project Type**: Web (MVC with clear Model/View/Controller separation)
**Performance Goals**: N/A (explicitly out of scope unless specified in use cases/tests)
**Constraints**: Use-case-only scope; MVC separation; vanilla HTML/CSS/JS
**Scale/Scope**: 23 use cases (UC-01 to UC-23) and their acceptance suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Plan references specific `use_cases/` and `acceptance_tests/` files for all requirements and scope decisions. **PASS**
- No features beyond what is explicitly described in the use cases/tests. **PASS**
- MVC separation is defined and responsibilities are assigned. **PASS**
- Only vanilla HTML/CSS/JS are used; no frameworks or CSS libraries. **PASS**
- Planning artifacts avoid source code and include data model and contract coverage. **PASS**
- Ambiguities are flagged for clarification instead of assumed. **PASS**

## Project Structure

### Documentation (this feature)

```text
/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
/home/ajchan/ECE493/lab/lab2/493-lab2-final/
src/
├── models/
├── controllers/
├── views/
├── services/
└── assets/

tests/
└── acceptance/
```

**Structure Decision**: Single web project using MVC directories under `src/` with acceptance tests tracked under `tests/acceptance/`.

## Complexity Tracking

No constitution violations requiring justification.

## Phase 0: Outline & Research (Complete)

**Unknowns from Technical Context**: Resolved using use cases and acceptance tests.

**Research tasks executed**:
- Resolve password validation ambiguity (UC-02, UC-04) without adding non-specified rules.
- Reconcile login identifier usage (UC-03 email vs UC-05 email/username).
- Confirm deadline enforcement behavior for review access and submission (UC-12, UC-14).
- Confirm schedule publication visibility and optional notifications (UC-20).
- Confirm UC-18 draft generation and UC-20 publication rule alignment.
- Confirm ticket failure behavior after payment (UC-22).
- Confirm review form required fields and unspecified scoring scales (UC-12, UC-14).
- Keep pricing configuration and storage technology abstract (UC-23, UC-01 to UC-23).
- Explicitly exclude non-specified NFRs (performance, availability SLAs, accessibility, browser support).

**Artifact**:
- /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/research.md

## Phase 1: Design & Contracts (Complete)

**Artifacts**:
- Data model: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/data-model.md
- Contracts: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/contracts/cms-api.yaml
- Quickstart: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/quickstart.md

**Agent context update**:
- /home/ajchan/ECE493/lab/lab2/493-lab2-final/.specify/scripts/bash/update-agent-context.sh codex (completed)

## Constitution Check (Post-Design)

- Use-case-only scope preserved with clarified ambiguities recorded in research. **PASS**
- MVC separation defined in structure and contracts. **PASS**
- Vanilla web stack maintained. **PASS**
- Data model and contracts provide traceability to use cases/tests. **PASS**

## Phase 2: Planning (Tightened for Task Generation)

### Planning Goals
- Generate small, incremental tasks that each map to a specific use-case step or acceptance scenario.
- Ensure every main flow and extension path in UC-01 to UC-23 is represented.
- Preserve MVC separation by creating discrete Model, Service, Controller, and View tasks.
- Make error handling explicit for all specified failure paths.
- Honor clarified requirements for authorized user roles, role-based dashboards, review form fields, required data fields, and optional schedule notifications.

### Tasking Granularity Rules
- Each task must trace to a specific use-case step or acceptance test (include file and step reference).
- Separate tasks for success-path behavior and each extension/failure path.
- Separate tasks for data validation rules and UI error presentation.
- Separate tasks for integration boundaries (file upload, notification, payment, public website publication, ticketing).
- No task should span multiple use cases unless it is a shared foundation (e.g., router, auth, data store).

### Shared Foundation Task Seeds (Trace: UC-01 to UC-23)
- MVC skeleton (routes, view helpers, data store interface).
- Session/authentication service (login, session creation, session checks).
- Role-based access checks in controllers (authorized user = registered + authenticated + correct role).
- Role-based dashboard routing and view stubs.
- Shared error display patterns in views (no sensitive data).
- Integration adapters for: file upload, notification, payment, public website publication, ticketing.
- NFR tasks: protect credentials/payment data in UI errors; fail safely on external service errors.

### Use-Case Task Seeds (Each bullet should become one or more atomic tasks)

**UC-01 Register Account**
- Registration form view with required fields (email, password).
- Email format and uniqueness validation; password validation per UC-02.
- Persist account and redirect to login on success.
- Error display for invalid/duplicate data.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-01_Register_Account.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-01_Acceptance_Test_Suite.md.

**UC-02 Validate Registration Credentials**
- Email format validation and uniqueness check prior to registration.
- Password validation limited to explicit rules in use cases/ATs.
- Inline error messaging for invalid credentials.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-02_Validate_Registration_Credentials.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-02_Acceptance_Test_Suite.md.

**UC-03 Log In to CMS**
- Login form (email label) and authentication flow; support identifier input.
- Session creation and role-based dashboard redirect.
- Service unavailable error handling.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-03_Log_In_to_CMS_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-03_Acceptance_Test_Suite_REFINED.md.

**UC-04 Change Account Password**
- Change-password form and validation of current/new passwords.
- Update password in data store while keeping session active.
- Error messages for invalid current or new password.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-04_Change_Account_Password_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-04_Acceptance_Test_Suite_REFINED.md.

**UC-05 Handle Login Failure**
- Error messages for unknown account and incorrect password.
- Allow retry; no session created on failure.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-05_Handle_Login_Failure_and_Display_Error_Message_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-05_Acceptance_Test_Suite_REFINED.md.

**UC-06 Submit Paper Manuscript**
- Submission form with authors, affiliation/contact, abstract, keywords, title, file upload.
- File validation (PDF/Word/LaTeX) and size <= 7MB.
- Persist submission and set status Submitted.
- Error handling for missing fields, invalid file, size limit, or service failure.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-06_Submit_Paper_Manuscript_REREFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-06_Acceptance_Test_Suite_REREFINED.md.

**UC-07 Update Submitted Paper Manuscript**
- Replace manuscript workflow for submitted papers.
- Validate new file constraints; preserve previous version on failure.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-07_Update_Submitted_Paper_Manuscript_REREFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-07_Acceptance_Test_Suite_REREFINED.md.

**UC-08 Validate Paper Submission Fields**
- Validate required fields and file constraints before submission.
- Show specific validation errors and block submission until resolved.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-08_Validate_Paper_Submission_Fields_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-08_Acceptance_Test_Suite_REFINED.md.

**UC-09 Save Submission Progress**
- Save draft at any step with minimal required info (at least title/identifier).
- List and resume drafts.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-09_Save_Submission_Progress_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-09_Acceptance_Test_Suite_REFINED.md.

**UC-10 Assign Reviewers to Paper**
- Assign reviewers by email; validate accounts exist.
- Enforce exactly 3 reviewers and max 5 assignments per reviewer.
- Send invitations and persist assignments.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-10_Assign_Reviewers_to_Paper_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-10_Acceptance_Test_Suite_REFINED.md.

**UC-11 Reviewer View Accepted Assigned Papers**
- Reviewer dashboard shows accepted assignments only.
- Display paper title and abstract summary.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-11_Reviewer_View_Accepted_Assigned_Papers_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-11_Acceptance_Test_Suite_REFINED.md.

**UC-12 Reviewer Access Review Form**
- Access review form only if invitation accepted and deadline open.
- Review form includes scores, comments, recommendation (scales unspecified).
- Handle access denial, authorization errors, and system errors.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-12_Reviewer_Access_Review_Form_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-12_Acceptance_Test_Suite_REFINED.md.

**UC-13 Reviewer Accept or Decline Invitation**
- Display paper title, abstract, and deadline in invitation view.
- Record accept/decline; notify editor; enforce invalid/expired invitation handling.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-13_Reviewer_Accept_or_Decline_Invitation_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-13_Acceptance_Test_Suite_REFINED.md.

**UC-14 Submit Completed Review Form**
- Validate review form fields; submit before deadline only.
- Save review and notify editor when all three complete.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-14_Submit_Completed_Review_Form_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-14_Acceptance_Test_Suite_REFINED.md.

**UC-15 Editor Receive Completed Review Forms**
- Provide editor access to completed review sets once all three submitted.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-15_Editor_Receive_Completed_Review_Forms_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-15_Acceptance_Test_Suite_REFINED.md.

**UC-16 Make Final Paper Decision**
- Allow editor decision only after three reviews complete.
- Record accept/reject decision and persist.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-16_Make_Final_Paper_Decision_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-16_Acceptance_Test_Suite_REFINED.md.

**UC-17 Notify Author of Final Decision**
- Send decision notification to authors and surface in UI if required.
- Handle notification failure without losing decision record.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-17_Notify_Author_of_Final_Decision_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-17_Acceptance_Test_Suite_REFINED.md.

**UC-18 Generate Conference Schedule**
- Generate draft schedule from accepted papers and display preview.
- Allow confirmation for publication, but apply UC-20 publication rules.
- Handle scheduling generation failure.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-18_Generate_Conference_Schedule_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-18_Acceptance_Test_Suite_REFINED.md.

**UC-19 Edit Conference Schedule**
- Edit schedule items (session, room, timeslot) and validate updates.
- Save updated draft and show changes.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-19_Edit_Conference_Schedule_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-19_Acceptance_Test_Suite_REFINED.md.

**UC-20 Publish Final Conference Schedule**
- Publish schedule; set status Final; make publicly accessible.
- Notification is optional; failure does not block publication.
- Handle publish failure and finalization failure.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-20_Publish_Final_Conference_Schedule_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-20_Acceptance_Test_Suite_REFINED.md.

**UC-21 Register for Conference and Pay**
- Display registration/payment form with attendee type selection and pricing.
- Process credit card payment; confirm registration on success; error on decline.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-21_Register_for_Conference_and_Pay_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-21_Acceptance_Test_Suite_REFINED.md.

**UC-22 Generate Registration Confirmation Ticket**
- Generate ticket after successful payment with unique reference.
- If ticket generation fails, mark ticket pending but keep registration active.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-22_Generate_Registration_Confirmation_Ticket_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-22_Acceptance_Test_Suite_REFINED.md.

**UC-23 View Conference Pricing by Attendee Type**
- Display pricing categories to guests and registered users.
- Pricing is sourced from preconfigured CMS database values.
- Trace: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/UC-23_View_Conference_Pricing_by_Attendee_Type_REFINED.md and /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/UC-23_Acceptance_Test_Suite_REFINED.md.

### Output Expectation for /speckit.tasks
- Each UC section above should expand into atomic tasks for Model, Service,
  Controller, View, and integration adapter layers.
- Each extension path must produce an explicit error-handling task.
- Each acceptance test suite must be referenced in at least one task.
