# Use Case UC-06: Validate Paper Submission Fields (REFINED)

## Goal in Context
Ensure an author’s submission includes all required metadata and a valid manuscript file so that only complete, valid papers can be submitted for review.

## Scope
Conference Management System (CMS)

## Level
Sub-function (System Validation)

## Primary Actor
Author

## Secondary Actors
CMS Validation Module, CMS Database, File Upload Service

## Trigger
Author attempts to submit a paper (UC-06) or update a manuscript (UC-06).

## Success End Condition
All required fields and file constraints are validated successfully, enabling submission/update to proceed.

## Failed End Condition
Validation fails and the system blocks submission/update, providing specific error messages and field highlights.

## Preconditions
- Author is logged into CMS.
- Author is on the submission form or update interface.
- Validation rules are available (FR4 constraints).

## Main Success Scenario
1. Author completes submission metadata fields and uploads a manuscript file.
2. Author selects **Submit Paper** (or **Confirm Update**).
3. CMS validates required metadata fields are present:
   - Author names and affiliation/contact information  
   - Paper abstract  
   - Keywords  
4. CMS validates that a manuscript file is uploaded.
5. CMS validates manuscript format is one of: PDF, Word, LaTeX.
6. CMS validates manuscript file size is ≤ **7MB**.
7. CMS confirms validation success and allows submission/update to proceed.

## Extensions
- **3a** Missing author information  
  - **3a1** CMS highlights author fields and blocks submission.

- **3b** Missing abstract  
  - **3b1** CMS highlights abstract field and blocks submission.

- **3c** Missing keywords  
  - **3c1** CMS highlights keywords field and blocks submission.

- **4a** No manuscript file uploaded  
  - **4a1** CMS displays error and blocks submission.

- **5a** Unsupported manuscript format  
  - **5a1** CMS rejects file and prompts PDF/Word/LaTeX.

- **6a** File exceeds 7MB  
  - **6a1** CMS blocks submission and requests smaller file.

- **7a** Validation module/database unavailable  
  - **7a1** CMS displays system error and prevents completion.

## Related Information
- This validation is invoked by UC-06 (Submit) and UC-06 (Update).
- Boundary enforcement is tested in UC-06/UC-06 acceptance suites.
