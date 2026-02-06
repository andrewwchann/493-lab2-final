# CMS Entity-Relationship Diagram

**Date**: February 5, 2026  
**Source**: Complete data model for all 23 use cases  
**Entities**: 14 total (11 core + 3 configuration)

## Diagram

```mermaid
erDiagram
    Account ||--o{ Submission : "authors"
    Account ||--o{ ReviewAssignment : "reviews"
    Account ||--o{ Review : "submits"
    Account ||--o{ Registration : "attends"
    
    Submission ||--|| ManuscriptFile : "has"
    Submission ||--o{ ReviewAssignment : "assigned to"
    Submission ||--o{ Review : "receives"
    Submission ||--o| Decision : "receives"
    Submission ||--o| ScheduleEntry : "scheduled in"
    
    Schedule ||--o{ ScheduleEntry : "contains"
    
    PricingCategory ||--o{ Registration : "defines fee for"
    Registration ||--|| Ticket : "has"
    
    SubmissionWindow ||--o{ Submission : "controls"
    ReviewDeadline ||--o{ Review : "controls"
    RegistrationWindow ||--o{ Registration : "controls"
    
    Account {
        string account_id PK
        string name
        string email UK
        string role
        string credential
        string status
        datetime created_at
    }
    
    Submission {
        string submission_id PK
        string title
        string[] authors
        string affiliation
        string contact_info
        string abstract
        string[] keywords
        string status
        datetime created_at
        datetime updated_at
    }
    
    ManuscriptFile {
        string file_id PK
        string submission_id FK
        string filename
        string format
        float size_mb
        datetime uploaded_at
        int version
    }
    
    ReviewAssignment {
        string assignment_id PK
        string submission_id FK
        string reviewer_account_id FK
        string status
        datetime assigned_at
    }
    
    Review {
        string review_id PK
        string submission_id FK
        string reviewer_account_id FK
        object ratings
        string comments
        string recommendation
        string status
        datetime submitted_at
    }
    
    Decision {
        string decision_id PK
        string submission_id FK
        string outcome
        datetime decided_at
    }
    
    Schedule {
        string schedule_id PK
        string status
        datetime generated_at
        datetime published_at
    }
    
    ScheduleEntry {
        string entry_id PK
        string schedule_id FK
        string submission_id FK
        string session
        string room
        string timeslot
    }
    
    PricingCategory {
        string category_id PK
        string name
        float fee_amount
        string currency
    }
    
    Registration {
        string registration_id PK
        string attendee_account_id FK
        string category_id FK
        string payment_status
        datetime registered_at
    }
    
    Ticket {
        string ticket_id PK
        string registration_id FK
        string reference_number UK
        datetime issued_at
        string status
    }
    
    SubmissionWindow {
        string window_id PK
        datetime opens_at
        datetime closes_at
    }
    
    ReviewDeadline {
        string deadline_id PK
        datetime closes_at
    }
    
    RegistrationWindow {
        string window_id PK
        datetime opens_at
        datetime closes_at
    }
```

## Entity Summary

**Core Entities (11)**:
1. Account - User identities (author, reviewer, editor, attendee)
2. Submission - Paper submissions with metadata
3. ManuscriptFile - Uploaded paper files
4. ReviewAssignment - Paper-to-reviewer mappings
5. Review - Reviewer evaluations
6. Decision - Final accept/reject outcomes
7. Schedule - Conference schedule versions
8. ScheduleEntry - Individual paper placements
9. PricingCategory - Attendee types and fees
10. Registration - Conference registrations
11. Ticket - Registration confirmations

**Configuration Entities (3)**:
12. SubmissionWindow - Submission period constraints
13. ReviewDeadline - Review period constraints
14. RegistrationWindow - Registration period constraints

## Key Relationships

- Account authors multiple Submissions (1:N)
- Submission has one ManuscriptFile (1:1)
- Submission receives multiple ReviewAssignments (1:N)
- Submission receives multiple Reviews (1:N)
- Submission receives one Decision after reviews complete (1:0..1)
- Schedule contains multiple ScheduleEntries (1:N)
- Account attends via multiple Registrations (1:N)
- Registration has one Ticket (1:1)

## State Transitions

- Submission: Draft → Submitted
- ReviewAssignment: Invited → Accepted | Declined
- Review: In Progress → Submitted
- Schedule: Draft → Final
- Registration: Pending → Approved | Declined
- Ticket: Generated | Delayed

## Viewing Instructions

To view this diagram in VS Code:
1. Install the "Markdown Preview Mermaid Support" extension if not already installed
2. Open this file and press Ctrl+Shift+V (or Cmd+Shift+V on Mac) to preview
3. The diagram will render visually in the preview pane

Alternatively, view at https://mermaid.live by copying the diagram code.
