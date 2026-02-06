# Data Model: Use Case Specification Expansion

**Date**: February 5, 2026  
**Spec**: `/home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md`

**Entity-Relationship Diagram**: Complete ER diagram showing all entities and relationships is available in the architecture validation document and rendered as a Mermaid diagram.

## Core Entities

### Account
- **Purpose**: Represents a CMS user identity (author, reviewer, editor, attendee).
- **Key Fields**: account_id, name, email (unique), role, credential, status (active/inactive), created_at.
- **Validation Rules**: Email format valid and unique; password meets security standards (clarified in spec).
- **Relationships**: One Account may author many Submissions, review many Reviews, and have one or more Registrations.

### Submission
- **Purpose**: Represents a paper submission or draft.
- **Key Fields**: submission_id, title, authors list, affiliation/contact info, abstract, keywords, status (Draft, Submitted), created_at, updated_at.
- **Validation Rules**: Required metadata present for submission; minimum draft info required for saving draft.
- **Relationships**: One Submission has one Manuscript File; one Submission has many Review Assignments and Reviews; one Submission has one Decision (after reviews complete).
- **State Transitions**: Draft → Submitted (within submission window); Submitted remains Submitted on manuscript update.

### Manuscript File
- **Purpose**: Stores manuscript file attributes for a submission.
- **Key Fields**: file_id, submission_id, filename, format (PDF/Word/LaTeX), size_mb, uploaded_at, version.
- **Validation Rules**: Format must be PDF/Word/LaTeX; size ≤ 7.0MB.
- **Relationships**: One Manuscript File belongs to one Submission.

### Review Assignment
- **Purpose**: Tracks paper-to-reviewer assignment and invitation status.
- **Key Fields**: assignment_id, submission_id, reviewer_account_id, status (Invited, Accepted, Declined), assigned_at.
- **Validation Rules**: Exactly three reviewers per submission; reviewer workload ≤ 5 assignments.
- **Relationships**: Many Review Assignments belong to one Submission; each Assignment links to one reviewer Account.

### Review
- **Purpose**: Stores reviewer evaluation results.
- **Key Fields**: review_id, submission_id, reviewer_account_id, ratings, comments, recommendation, status (In Progress, Submitted), submitted_at.
- **Validation Rules**: Required fields completed; submission must be within review period; only accepted reviewers can submit.
- **Relationships**: Many Reviews belong to one Submission; each Review links to one reviewer Account.

### Decision
- **Purpose**: Stores final accept/reject outcome.
- **Key Fields**: decision_id, submission_id, outcome (Accept, Reject), decided_at.
- **Validation Rules**: Only after exactly three reviews are completed.
- **Relationships**: One Decision belongs to one Submission.

### Schedule
- **Purpose**: Represents the conference schedule.
- **Key Fields**: schedule_id, status (Draft, Final), generated_at, published_at.
- **Relationships**: One Schedule contains many Schedule Entries.
- **State Transitions**: Draft → Final upon publish confirmation.

### Schedule Entry
- **Purpose**: Represents a paper’s placement in the schedule.
- **Key Fields**: entry_id, schedule_id, submission_id, session, room, timeslot.
- **Validation Rules**: No room/time conflicts; timeslots within conference hours.

### Pricing Category
- **Purpose**: Defines attendee types and fees.
- **Key Fields**: category_id, name (e.g., Student, Professional), fee_amount, currency.
- **Validation Rules**: Categories must exist before registration.

### Registration
- **Purpose**: Records conference registration and payment status.
- **Key Fields**: registration_id, attendee_account_id, category_id, payment_status (Pending, Approved, Declined), registered_at.
- **Validation Rules**: Registration confirmed only on approved payment.
- **Relationships**: One Registration belongs to one attendee Account and one Pricing Category; one Registration has one Ticket.

### Ticket
- **Purpose**: Proof of successful registration.
- **Key Fields**: ticket_id, registration_id, reference_number (unique), issued_at, status (Generated, Delayed).
- **Validation Rules**: Generated only after approved payment; if generation fails, status is Delayed but registration remains confirmed.

## Configuration / Policy Entities

### Submission Window
- **Purpose**: Defines start/end of submission period.
- **Key Fields**: window_id, opens_at, closes_at.
- **Usage**: Submission from drafts blocked after close.

### Review Deadline
- **Purpose**: Defines end of review period.
- **Key Fields**: deadline_id, closes_at.
- **Usage**: Review form access and submission blocked after deadline.

### Registration Window
- **Purpose**: Defines when registration is open.
- **Key Fields**: window_id, opens_at, closes_at.
- **Usage**: Registration only allowed while open.

## Relationships Summary

- Account 1..* Submission (author)
- Submission 1..1 Manuscript File
- Submission 1..* Review Assignment
- Submission 1..* Review
- Submission 1..1 Decision (after reviews complete)
- Schedule 1..* Schedule Entry
- Account 1..* Registration (attendee)
- Registration 1..1 Ticket

## Notes

- All entities and rules are derived from the use cases and the clarified spec.
- No storage technology is assumed; this model is conceptual.
