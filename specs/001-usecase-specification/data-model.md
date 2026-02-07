# Data Model: Use Case Specification Expansion

**Spec**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/specs/001-usecase-specification/spec.md
**Use Cases**: /home/ajchan/ECE493/lab/lab2/493-lab2-final/use_cases/

## Entities

### Account
Fields:
- id
- email (unique, required)
- username (optional, unique if present)
- password_hash
- roles (set: author, reviewer, editor, attendee)
- status (active, locked)
- created_at

Notes:
- Registration uses email; login accepts email or username (UC-03, UC-05).
- Authorized user means registered + authenticated + required role.

### Session
Fields:
- id
- account_id
- created_at
- expires_at

### Submission
Fields:
- id
- author_account_id
- title
- abstract
- keywords
- status (draft, submitted, under_review, accepted, rejected)
- created_at
- updated_at

Notes:
- Title/identifier required for drafts and reviewer displays (UC-09, UC-11,
  UC-13).

### Manuscript
Fields:
- id
- submission_id
- file_name
- file_type (pdf, word, latex)
- file_size_mb
- storage_ref
- version
- uploaded_at
- is_current

### ReviewAssignment
Fields:
- id
- submission_id
- reviewer_account_id
- status (invited, accepted, declined)
- review_deadline
- assigned_at

Notes:
- Exactly 3 assignments per submission; reviewer workload max 5 active
  assignments (UC-10).

### ReviewForm
Fields:
- id
- assignment_id
- scores
- comments
- recommendation
- status (in_progress, submitted)
- submitted_at

Notes:
- Scoring scales are not specified; only field presence is required (UC-12,
  UC-14).

### ReviewDecision
Fields:
- id
- submission_id
- editor_account_id
- decision (accept, reject)
- rationale
- decided_at

### Schedule
Fields:
- id
- status (draft, final)
- generated_at
- published_at
- published_html_snapshot

### ScheduleItem
Fields:
- id
- schedule_id
- submission_id
- session
- room
- start_time
- end_time

### PricingCategory
Fields:
- id
- attendee_type
- price
- currency

Notes:
- Pricing is preconfigured; configuration UI is out of scope (UC-23).

### Registration
Fields:
- id
- attendee_account_id
- pricing_category_id
- status (pending_payment, registered, payment_declined, ticket_pending)
- created_at

### PaymentTransaction
Fields:
- id
- registration_id
- amount
- status (approved, declined)
- confirmation_number
- processed_at

### Ticket
Fields:
- id
- registration_id
- ticket_reference
- status (generated, pending)
- created_at

### NotificationLog
Fields:
- id
- notification_type (review_invitation, review_accept, review_decline,
  decision_notice, schedule_published, ticket_ready)
- recipient_account_id
- related_entity_id
- status (sent, failed, pending)
- created_at

## Relationships
- Account 1..* Submission
- Submission 1..* Manuscript (one current)
- Submission 1..3 ReviewAssignment
- ReviewAssignment 0..1 ReviewForm
- Submission 0..1 ReviewDecision
- Schedule 1..* ScheduleItem
- PricingCategory 1..* Registration
- Registration 0..1 PaymentTransaction
- Registration 0..1 Ticket

## Validation & Rules (Derived From Use Cases)
- Email format and uniqueness validated at registration (UC-01, UC-02).
- Password validation limited to explicit use-case/acceptance-test checks
  (UC-02, UC-04).
- Manuscript file types limited to PDF/Word/LaTeX and size <= 7MB (UC-06, UC-08).
- Draft save requires minimal identifying info (at least title) (UC-09).
- Exactly 3 reviewers per submission; reviewers may not exceed 5 assignments
  (UC-10).
- Review form access requires accepted assignment and open deadline (UC-12).
- Review submission blocked after deadline (UC-14).
- Editor decision only after 3 completed reviews (UC-15, UC-16).
- Publishing schedule makes it public; notifications are optional (UC-20).
- Ticket generation failure does not roll back registration (UC-22).

## State Transitions (Key)
- Submission:
  - draft -> submitted (UC-06)
  - submitted -> under_review (UC-10)
  - under_review -> accepted/rejected (UC-16)
- ReviewAssignment:
  - invited -> accepted/declined (UC-13)
- ReviewForm:
  - in_progress -> submitted (UC-14)
- Schedule:
  - draft -> final (after publish confirmation) (UC-20)
- Registration:
  - pending_payment -> registered (UC-21)
  - registered -> ticket_pending (UC-22 failure)
  - pending_payment -> payment_declined (UC-21)
- Ticket:
  - pending -> generated (UC-22 retry)
