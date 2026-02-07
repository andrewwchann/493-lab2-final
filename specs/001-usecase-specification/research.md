# Research Log: Use Case Specification Expansion

**Spec**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md
**Use Cases**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/
**Acceptance Tests**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/acceptance_tests/

This research resolves ambiguities in the technical context using only the
authoritative use cases and acceptance tests.

## Decision 1: Password Rules Are Minimal (Only What Use Cases Require)
Decision: Enforce only the password validations explicitly referenced in the use
cases and acceptance tests (e.g., non-empty, confirmation match, and any
explicit AT constraints). No additional complexity rules are introduced.
Rationale: UC-02 explicitly states password security standards are not specified.
The constitution forbids assumptions beyond use cases/tests.
Alternatives considered: Adding standard complexity rules (rejected; not in use
cases or acceptance tests).

## Decision 2: Login Identifier Supports Email or Username
Decision: Registration requires email, but login accepts email or username when
use cases allow (UC-05). UC-03 remains email-first in UI labels and validation.
Rationale: UC-03 uses email; UC-05 explicitly allows email/username. Supporting
both preserves flow fidelity without inventing new behavior.
Alternatives considered: Email-only login (rejected; violates UC-05).

## Decision 3: Deadlines Gate Access and Submission
Decision: Review deadlines block both review-form access (UC-12) and review
submission (UC-14). Deadline values are stored on reviewer assignments and
validated at access/submit time.
Rationale: UC-12 and UC-14 specify deadline closure behaviors. No additional
deadline management features are added.
Alternatives considered: Deadline-only at submission time (rejected; conflicts
with UC-12 access restriction).

## Decision 4: Schedule Becomes Public on Publish (Notifications Optional)
Decision: Publishing the schedule marks it as Final and makes it publicly
accessible (UC-20). Notification delivery is optional and does not block
publication.
Rationale: UC-20 requires public visibility and includes notification failure
handling. No additional public site features beyond schedule publication are
added.
Alternatives considered: Restricting schedule to logged-in users or requiring
notification delivery (rejected; violates UC-20 acceptance tests).

## Decision 5: UC-18 Generates Draft; UC-20 Governs Publication
Decision: UC-18 generates and stores a draft schedule and may proceed to
publication only via UC-20 confirmation and failure handling rules.
Rationale: UC-18 and its acceptance tests include publication steps; UC-20
defines the authoritative publication behaviors. Aligning keeps consistency.
Alternatives considered: Publishing directly in UC-18 without UC-20 rules
(rejected; conflicts with UC-20 acceptance tests).

## Decision 6: Ticket Failure Does Not Roll Back Registration
Decision: If ticket generation fails after successful payment, the attendee
remains Registered and the ticket is marked pending/delayed (UC-22).
Rationale: UC-22 extension explicitly states payment success with delayed ticket.
Alternatives considered: Reverting registration on ticket failure (rejected).

## Decision 7: Review Form Fields Are Defined, Scales Are Not
Decision: Review form must include ratings/scores, comments, and a
recommendation, but scoring scales are unspecified.
Rationale: UC-12 and UC-14 list required fields; no scale definition exists in
use cases/tests.
Alternatives considered: Defining specific scales (rejected; not in sources).

## Decision 8: Pricing Configuration Is Pre-Set in CMS Database
Decision: Pricing categories and fees are preconfigured in the CMS database;
there is no UI to manage pricing in scope.
Rationale: UC-23 requires viewing pricing; no configuration workflow exists in
use cases/tests.
Alternatives considered: Adding admin pricing management (rejected).

## Decision 9: Storage Technology Remains Abstract
Decision: Persist data via an abstract CMS data store interface; do not select a
concrete DB technology.
Rationale: Use cases specify “CMS database” without technology details. The
constitution prohibits adding technology assumptions.
Alternatives considered: Selecting a specific DB (rejected).

## Decision 10: External Services Treated as Integration Boundaries
Decision: File upload, notification, payment, public publication, and ticketing
are modeled as external services with explicit success/failure behaviors and
error handling in contracts.
Rationale: Multiple use cases reference these services; explicit contracts
support traceability without implementation assumptions.
Alternatives considered: Inline implementations in controllers (rejected; breaks
MVC separation and obscures contracts).

## Decision 11: Non-Functional Constraints Are Explicitly Excluded
Decision: Performance targets, availability SLAs, accessibility requirements,
and browser support constraints are out of scope unless directly specified in
use cases/tests.
Rationale: Spec scope explicitly excludes these requirements; adding them would
violate use-case-only scope.
Alternatives considered: Introducing default NFRs (rejected).
