# Use Case UC-04: Change Account Password (REFINED)

## Goal in Context
Allow an authenticated user to change their account password so that they can maintain account security within the CMS.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
User (Author, Reviewer, Editor)

## Secondary Actors
Authentication Service, CMS Database

## Trigger
User selects **Change Password** from account settings.

## Success End Condition
The user’s password is updated successfully, and future logins require the new password.

## Failed End Condition
Password change is rejected due to incorrect current password, invalid new password, or system error.

## Preconditions
- User is logged into CMS (UC-03).
- User account exists and is active.
- CMS password validation rules apply (UC-02).

## Main Success Scenario
1. User navigates to **Account Settings**.
2. CMS displays the Change Password form.
3. User enters their current password.
4. User enters a new password and confirms it.
5. CMS validates the current password matches stored credentials.
6. CMS validates the new password satisfies password rules (UC-02).
7. CMS updates the password securely in the database.
8. CMS confirms the password change was successful.
9. User continues using CMS with unchanged session, but future logins require the new password.

## Extensions
- **5a** Current password is incorrect  
  - **5a1** CMS displays an error and does not update password.

- **4a** New password confirmation does not match  
  - **4a1** CMS highlights mismatch and prevents submission.

- **6a** New password fails validation rules  
  - **6a1** CMS displays password rule error and requests correction.

- **7a** Database update fails  
  - **7a1** CMS displays system error and advises retry later.

## Related Information
- Password strength and validation constraints are defined in UC-02.
- Password change is part of authenticated account management.
