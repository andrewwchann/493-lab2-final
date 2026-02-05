# Acceptance Test Suite: UC-06 Reviewer Accept or Decline Invitation (REFINED)

## Purpose
Verify that reviewers must explicitly accept or decline invitations, that responses are recorded correctly, and that review access is enabled only after acceptance.

---

## Test Data Sets

### Valid Acceptance (A1)
- Reviewer accepts assignment successfully

### Decline Case (D1)
- Reviewer declines due to conflict

### Expired Invitation (E1)
- Invitation link opened after deadline

### Storage Failure (S1)
- Simulated database failure recording response

---

## Acceptance Tests

### UC06-AT-01 — Accept invitation enables review workflow
- **Given** reviewer is invited to a paper  
- **When** reviewer accepts (A1)  
- **Then** CMS records acceptance and enables UC-06 review form access  
- **And** editor is notified

---

### UC06-AT-02 — Decline invitation triggers reassignment
- **Given** reviewer is invited  
- **When** reviewer declines (D1)  
- **Then** CMS records decline and notifies editor  
- **And** paper remains pending reassignment

---

### UC06-AT-03 — Expired invitation cannot be accepted
- **Given** invitation is expired (E1)  
- **When** reviewer opens link  
- **Then** CMS blocks response and displays expiration error

---

### UC06-AT-04 — Storage failure does not activate assignment
- **Given** reviewer selects Accept  
- **When** response cannot be stored (S1)  
- **Then** CMS displays error and assignment is not activated

---

## Exit Criteria
UC-06 is accepted when reviewer responses are enforced correctly and review access is granted only after acceptance.
