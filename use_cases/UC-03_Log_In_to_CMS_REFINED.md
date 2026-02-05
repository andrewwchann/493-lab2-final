# Use Case UC-03: Log In to CMS (REFINED)

## Goal in Context
Allow a registered user to log into the Conference Management System so that they can access authorized CMS features.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
User (Author, Reviewer, Editor)

## Secondary Actors
Authentication Service, CMS Database

## Trigger
User selects **Log In** and submits their email and password.

## Success End Condition
User is authenticated successfully and redirected to their CMS dashboard with an active session.

## Failed End Condition
Login is rejected and the user is informed of invalid credentials or system error.

## Preconditions
- User has an existing registered account (UC-01).
- User is not currently logged in.
- CMS login service is available.

## Main Success Scenario
1. User navigates to the CMS login page.
2. CMS displays the login form requesting email and password.
3. User enters registered email and password.
4. User submits the login form.
5. CMS validates the email exists in the user database.
6. CMS verifies the password matches the stored credentials.
7. CMS creates an authenticated session for the user.
8. CMS redirects the user to their dashboard based on role (author/reviewer/editor).
9. CMS displays a successful login confirmation.

## Extensions
- **5a** Email address is not registered  
  - **5a1** CMS displays an error: “Account not found.”  
  - **5a2** CMS suggests registration (UC-01).

- **6a** Password is incorrect  
  - **6a1** CMS displays an error: “Invalid password.”  
  - **6a2** User may retry or select Forgot Password (UC-04).

- **4a** User submits empty fields  
  - **4a1** CMS highlights missing required inputs and prevents submission.

- **7a** Authentication service unavailable  
  - **7a1** CMS displays system error and asks user to retry later.

## Related Information
- Login enables access to all role-based CMS workflows.
- Credential validation rules are defined in UC-02.
