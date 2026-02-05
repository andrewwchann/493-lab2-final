# Use Case UC-06: Submit Paper Manuscript (RE-REFINED)

## Goal in Context
Allow an author to submit a complete paper manuscript with all required metadata so that it enters the conference review process.

## Scope
Conference Management System (CMS)

## Level
User Goal

## Primary Actor
Author

## Secondary Actors
CMS Database, File Upload Service

## Trigger
Author selects **New Paper Submission** from the CMS interface.

## Success End Condition
The manuscript and all required submission fields are stored successfully and the paper is marked as Submitted.

## Failed End Condition
Submission is rejected due to missing required fields, invalid manuscript format, file size violation, or system error.

## Preconditions
- Author is logged into CMS.
- Submission window is open.
- Author has a manuscript file ready.

## Main Success Scenario
1. Author navigates to **Submit Paper**.
2. CMS displays the submission form requiring:
   - Author names and affiliation/contact information  
   - Paper abstract  
   - Keywords  
   - Main source file upload  
3. Author enters all required metadata fields.
4. Author uploads the manuscript file in an accepted format (PDF, Word, LaTeX).
5. CMS validates that the manuscript file size is ≤ **7MB**.
6. Author reviews submission details.
7. Author selects **Submit Paper**.
8. CMS stores the submission record and manuscript file in the database.
9. CMS confirms successful submission and marks paper status as Submitted.

## Extensions
- **3a** Required metadata fields are missing  
  - **3a1** CMS highlights missing fields and blocks submission.

- **4a** Unsupported manuscript file format  
  - **4a1** CMS rejects upload and prompts author to use PDF/Word/LaTeX.

- **5a** Manuscript exceeds 7MB  
  - **5a1** CMS rejects submission and requests a smaller file.

- **2a** Author selects Save instead of Submit  
  - **2a1** CMS saves progress at any step and stores submission as Draft (UC-06).

- **8a** Database or upload service failure  
  - **8a1** CMS displays system error and does not mark submission complete.

## Related Information
- Manuscript constraints are defined in FR4 (file type + max size).
- Authors may save at any step using Save button (FR5).
