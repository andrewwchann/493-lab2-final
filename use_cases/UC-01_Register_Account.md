# Use Case UC-01: Register Account

## Goal in Context
Allow a new user to create a CMS account so they can access CMS features.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
User (Guest / Public User)

## Secondary Actors
CMS Database

## Trigger
User requests to register on the system.

## Success End Condition
User account is created and stored in the CMS database, and the user is redirected to the login screen.

## Failed End Condition
User account is not created, and the system displays an error message indicating invalid or duplicate information.

## Preconditions
- User is not currently registered or logged into CMS.
- User can access the CMS registration webpage.

## Main Success Scenario
1. User requests to register on the CMS system.
2. System displays the registration form.
3. User fills out the registration form with required information.
4. User submits the registration form.
5. System validates the provided email and password.
6. System stores the new user account information.
7. System redirects the user to the login page.

## Extensions
- **5a** Email is invalid or already registered
  - **5a1** System displays an error message and prompts the user to correct the information.

- **5b** Password does not meet security requirements
  - **5b1** System displays an error message and allows the user to re-enter the password.

## Related Information
- **Priority**: High
- **Frequency**: High
- **Open Issues**: Exact required fields for the registration form are not fully specified.
