Software Requirements 
Specification
for
Conference Management 
System (CMS)
Version 1.0 approved

Name Date Reason for Changes Version
CMS developers Team Jan. 2. 2022 - Initial draft for review 0.1
CMS developers Team Jan. 10, 2022 - Add Stakeholder Analysis to SRS
- Update table of contents
1.0

1. INTRODUCTION 
1.1. Purpose 
This SRS document provides a complete description of the Conference Management System (CMS), 
the system function and features. CMS is a system defined by XYZ department at the University of 
Alberta. This SRS specifies the purpose and scope of the project. Moreover, features, interfaces and 
functions of the project are specified in this document. The expected audience of this document is the 
teaching team of ECE-493 and registered students in this course. This SRS is a repository for all 
requirements that the CMS system should possess. This specification is a baseline upon which all 
subsequent design, implementation, and test/validation plan will be specified and implemented. 
1.2. Scope 
CMS is a web application that will support managing a conference organization process. This system 
includes registration, paper submission, peer reviewer assignments, publishing announcements, 
scheduling the accepted papers. CMS is going to be a conference management system for a technical 
specific conference hold by the XYZ department at University of Alberta, but it should be usable and 
extendable for other conferences. This version of CMS excludes of accommodation facilities for the 
conference audience. However, it provides useful information through announcement in the webpage. 
Connecting to the publisher and delivering the right of authors to the publisher is one of the tasks of 
conference management system, which is performed manually at this time and it is out of the scope of 
CMS. 
2. OVERALL DESCRIPTION 
2.1. Product Perspective 
CMS is a conference management system that manages most of tasks of a conference. The system 
provides a responsive user interface, which can be accessed to via chrome and Firefox web browsers. 
CMS is implemented using Java, JavaScript as a web application with a relational database 
management system, SQL. 
2.2. User Characteristics 
CMS is mainly meant to be used by the University of Alberta staff and its conference audience. 
However, it should be implemented in a way to allow future extensions in scaling the number and type 
of users. Users of the current version are:
- Public users: guest who visit the web page of CMS. 
- Authorized users: registered users who are a referee, an author, or an audience who register for 
attending to the conference. This can be including: 
o Administrator: A university of Alberta member who mange the system. 
o Editor: This role is the same with the administrator in the current version of CMS but it 
can be changed in the future. Editor is in charge for managing the referee tasks and 
making decision about the papers. 
o Referee or reviewer: This role is an authorized member who can access to the list of 
assigned review tasks under her/his name. 
o Authors: Authors are correspondent authors who submit a paper to the system. 
o Attendees: Attendee is an authorized user who can be an editor, author, a reviewer, or a 
guest of the system who pays based on his/her role to attend in the conference. 
2.3. Operating Environment 
CMS is a responsive web application which can be ran on every platform where Web Browser exists. 
Web server should be reliable. Our team guarantee that CMS works responsive on Chrome and Firefox.
Web server and DBMS should be capable of receiving and managing several requests simultaneously
in 24 hours of a day. System shall possess these features on a server. 
2.4. Design and Implementation Constraints 
CMS is implemented in Object Oriented paradigm and in a three-layered architecture via Java and 
JavaScript, and SQL. SQL management Studio is used for administrating the SQL server. CMS is 
deployed continuously and in three phases on the provided cloud server by the University of Alberta
with XYZ features. CMS GUI design should be consistence with the University of Alberta web pages. 
3. System Features
This section specify system features and extracted functional software requirements from each one. 
Each requirement is described as a scenario and in detail. This information is used for design, 
implementation, and test of the system. 
3.1 User Registration
3.1.1 Description and Priority
Users can register in the system by filling out a form, asking users’ information. Upon 
submitting the form, the system verifies that user’s e-mail address is unique and valid and 
stores it in the database. This system allows string passwords which follow Password 
Security Standards. Users needs to be registered to use the system functionalities, except 
public announcements. Registered users are authors, editor, referees (reviewers), and 
Attendees. 
Priority: High
3.1.2 Stimulus/Response Sequences
Stimulus: User requests to be registered on the system.
Response: System redirects the user to the registration webpage/form.
Stimulus: User fills out and submits the form with their information.
Response: System validates email and password fields of the form. If they are valid, it 
stores the information in the database and redirects the user to the login screen. Otherwise, 
it displays an error message indicating that some of the fields are invalid.
3.1.3 Functional Requirements
FR1 - Request.Registration - The system shall provide the option of registering a new 
user, i.e., new email address, redirecting to the registration form on request.
3.2 User login
3.2.1 Description and Priority
Users must provide their credentials before accessing the system. The system compares the 
user’s username and password to the one stored in the database and either provides or 
denies access to other system features. Priority: High
3.2.2 Stimulus/Response Sequences
Stimulus: User requests to log-in to the system.
Response: System inquires the user for their username and password.
Stimulus: User provides their username and password.
Response: System compares provided credentials with the ones stored in the database, 
redirecting the user to their home page if they match or presenting an error message 
otherwise.
3.2.3 Functional Requirements
FR2 - Request.Log-in - The system shall check if the provided Username and Password 
are matched with the registered users.
FR3 - Change.Password - The system shall allow the user to change the password upon 
request and updates it in the database.
3.3 Paper submission
3.3.1 Description and Priority
Users have the option of submitting paper manuscripts trough CMS. The system provides 
a form questioning about the manuscript. The manuscript file must be uploaded in PDF, 
Word, or Latex formats with the maximum size of 7MB. Priority: High
3.3.2 Stimulus/Response Sequences
Stimulus: User requests to submit a new paper manuscript.
Response: System redirects user to the manuscript submission page.
Stimulus: User fills out the form with the required information and uploads their paper 
manuscript in PDF format.
Response: System validates if all fields have been filled and the uploaded file follows the 
system rules. If they are valid, the system stores the information in the database, shows a 
success message, and redirects the user to their home page. Otherwise, it displays an error 
message indicating that some of the fields are invalid. User can save the information at any 
step of paper submission process by a click on the save button. 
3.3.3 Functional Requirements
FR4 - Request.Submission - The system shall provide users the option of submitting their 
manuscripts. A registered user needs to log-in and provide the following information for 
the system: 
• Name of authors, their affiliation and contact information
• Abstract 
• Keywords of the paper
• Main source of the paper
When the user (author) clicks the submission button, the system shall check if all fields in 
the form are valid. For instance, invalid e-mail addresses, blanks, and source files which 
are not pdf, word, or latex should be informed to the user. Finally, this information is store 
in the database.
FR5- Save.Submission – The system saves information of a paper at any stage of the 
submission process, when author clicks the save button. System checks the paper 
information validity before saving them and inform the user if finds a violation. 
3.4 Referee assignment 
3.4.1 Description and Priority
Editor, a registered user who manage the hold conference, assigns three referees to 
submitted papers. Referees are selected by the editor, based on their research area. The list 
of available referees is guaranteed to be shared with CMS developers through human 
resource of XYZ department at University of Alberta. Each submitted paper must be 
reviewed by three reviewers while each reviewer(referee) should not have more than five 
papers for review. Priority: High
3.4.2 Stimulus/Response Sequences
Stimulus: Editor requests for referee assignment for each paper.
Response: System allows the editor to assign a paper to an e-mail address, i.e, reviewer e￾mail address. 
Stimulus: System notifies referee of the assignment in a form of a review invitation.
Response: System checks if three referees have been assigned to each paper. 
3.4.3 Functional Requirements
 FR6- Assign.Referee - The system shall provide editor the option to assign referees to 
submitted papers using referees’ e-mail address. When the editor put an email address as a 
selected reviewer for a paper, the system counts and checks if the reviewer has more than 
five assigned papers. The system informs editor of any violation. Otherwise, system sends 
the paper information to the referee’s email address as an invitation which can be accepted 
or rejected.
FR7- Save.Referee - The system shall put the paper under the referee’s account when 
she/he accepts the invitation. When a reviewer (referee) accepts an invitation, that reviewer 
is taken to be account as an assigned reviewer to the paper. The system counts and checks 
the number of assigned reviewers to each paper and inform the editor if it exceeds of three 
reviewers. 
3.5 Reviewing paper
3.5.1 Description and Priority
Referees can have access to the assigned papers in their account when they accept the 
review invitation. For each assigned paper, there is a review form including questions about 
the paper quality which should be filled by each referee. Review form information is shared 
by the CMS through the University of Alberta. When a reviewer accomplishes a paper 
review and submit it to the system, the filled forms will be saved in the database and sent 
to the editor. When all three reviewers submit their review forms, the system allows the 
editor for a final decision. The editor makes decision about acceptance or reject of a paper.
Priority: High
3.5.2 Stimulus/Response Sequences
Stimulus: Referee log-in and selects review action for each assigned paper.
Response: System redirects the reviewer to the paper review page, representing the review 
form. 
Stimulus: Reviewer fill the form and submit it.
Response: System saves it and sends it to the editor when all three reviewers are done. 
Stimulus: The editor makes a decision for each submitted paper with three completed 
review forms. 
Response: System save the decision and send it to the author of the paper. 
3.5.3 Functional Requirements
FR8 - Paper.Evaluation - The system shall let the referees access the review form of the 
paper, to which they were assigned and accepted. The system shall check if all fields in the 
form are valid (e.g., no invalid characters, no blanks), save it, and send it to the editor.
FR9- Make.Decision- When all three review forms are ready by the referees, system 
allows the editor to make the final decision for the paper. Editor’s decision is sent to the 
author and saved in the database as well. 
3.6 Scheduling
3.6.1 Description and Priority
System assigns time and rooms for accepted papers. This schedule is sent to the editor to
be checked or modified. The result is sent to the another with accepted papers and 
announced on the CMS webpage as well. Priority: High
3.6.2 Stimulus/Response Sequences
Stimulus: Administrator requests the conference schedule.
Response: System displays the schedule in HTML format.
Stimulus: Administrator asks for edits to the schedule.
Response: System update the schedule.
Response: The final version of the schedule is sent to the audience and is announced on the 
CMS webpage as well. 
3.6.3 Functional Requirements
FR10 - Make.Schedule - The system uses an algorithm, algorithm X, to make a schedule 
in HTML format. The schedule is sent to the authors of accepted papers. 
FR11 - Edit.Schedule - The system allows the editor to edit and update the schedule. Each 
time the new schedule is replaced as a final version. 
3.7 Conference registration 
3.7.1 Description and Priority
The system needs to provide a registration for all audience interested to take part in the 
conference. The price is different based on the type of attendance. This price list is provided 
by the University of Alberta. This list is announced in the CMS web page and readable for 
all registered or guest users of the web page. However, Conference attendee needs a ticket 
for attending to the conference. 
Priority: Medium 
3.7.2 Stimulus/Response Sequences
Stimulus: an authorized user requests for the conference registration. 
Response: System provides an interface for payment via credit cards. 
Response: The confirmation of a payment is sent to the user. 
3.7.3 Functional Requirements
FR12 – Pay.Attendance - The system provides an authorized user to pay for attending to 
the conference. Then, the payment confirmation is stored in the system and sent to the user
as a ticket. 
4. NONFUNCTIONAL REQUIREMENTS
Performance Requirements 
Performance of the system is measured using response time and the speed of the data submission. CMS 
should have a response time between X and Y. The first version of the system might have a limited file 
submission speed; that is why there will be no need for large network. However, it will be improved 
depending on the increase in usage.
Security Requirements
Information should be stored in database with a database replication approach. CMS must be able to 
backup and recover the data. User information, and paper source files must be saved and transmitted as 
encrypted data over the network.
Software Quality Attributes
CMS should provide a user-friendly UI which embeds notification and message which inform user of 
errors violations. Scheduling algorithm in CMS expect to show X% accuracy and Y% error against of 
test and experiment in test phase of the project.
5. Stakeholders
Possible stakeholders for this project include: 
- Users: Author, referee (reviewer), editor, guests.
- University of Alberta: XYZ department as product owner, Human resource of XYZ 
department, IT admin (future CMS admin), Research Ethics office
- Developer Team: Project manager, team members, a software maintainer 
- Publishers
- Copyright agency of Canada
Stakeholder Role Influence
and Power
Risk level to 
the project
Interest level importance

Authors The author is an authorized 
user of CMS who can 
submit a paper for a review 
process, get the review 
process result, and have a 
presentation on a specified 
date.
High
Authors' needs must 
be seen and 
embodied in the 
system to encourage 
them to use the 
CMS.
Medium
The authors’ 
manuscript can 
impact the CMS 
reputation in the 
future.
High
CMS improves the 
authors’ experience in 
research publications. 
Authors will be 
interested in CMS 
since it makes it 
easier and more 
reliable for them to 
upload, track, and 
publish their work.
high
Authors are one of 
the main user classes 
since they feed the 
CSM execution 
system.

referees Referees are in charge of 
reviewing the assigned 
papers.
The Referee is 
interested in the 
functionality and 
reliability of the 
project. They need to 
access the assigned 
paper with valid 
information. They 
have an influence on 
the design of the 
review form and 
how the information 
is presented. 
Besides, they 
influence the 
features and 
reliability of the 
application.
High
Suppose the 
Referee does 
not have 
enough 
knowledge to 
review the 
paper and does 
not adequately 
review the 
assigned article. 
In that case, the 
paper's validity 
will be affected, 
which can 
impact the CMS 
reputation in the 
future.
High
CMS gives the referee 
the platform to 
quickly review and 
read the paper. It also 
helps assign a proper 
amount of the article 
to each referee based 
on their research area. 
Therefore, it prevents 
conflicts and unfair 
workload.
High
Referees are one of 
the main user classes 
since they are in 
charge of validating 
and reviewing the 
papers.

editor The editor is in charge of 
managing the referee tasks 
and making a decision about 
the papers.
The editor is 
interested in the 
functionality and 
reliability of the 
project. They need to 
efficiently manage 
the referees and 
access the paper with 
valid information. 
The editor influences 
the features and 
reliability of the 
application. Their 
use cases require 
more development 
considerations and 
testing to be 
delivered 
sufficiently.
High
If the editor 
does not have 
enough 
knowledge to 
manage the 
referee and 
make a proper 
decision for 
each assigned 
article, its 
validity and 
CMS reputation 
can be affected.
High
CMS gives the editor 
the platform to easily 
review and manage 
the referee of the 
paper. It provides 
them with reliable 
features to manage 
their work and assign 
enough related 
referees to each 
article. This system 
helps them prevent 
mistakes and invalid 
paper submissions.
High
Editors are one of 
the main user classes 
since they are in 
charge of validating 
and reviewing the 
papers.

Attendee Attendee is one of the 
authors, someone from the 
industry, or a guest who 
attends or presents the paper 
at the conference.
Like the other user, 
the attendee is 
interested in the 
functionality and 
reliability of the 
project. They need to 
access the 
conference's 
registration prices; 
the price list must be 
accessible for all 
registered or guests. 
Besides, the
interface for 
payment should be 
functional and 
reliable.
low
They do not 
have a 
noticeable risk 
for the 
application.
High
CMS provides the 
platform to register at 
the conference and 
find the price list 
easily. Besides, they 
can get feedback on 
an early version of 
their latest work via 
this application and 
meet other people in 
their field.
Medium
The importance of 
Attendees is more 
for the event. The 
more people attend 
the conference, the 
more success 
company achieve.

guests They are the visitor of the 
webpage
Guests are external 
stakeholders in the 
development of 
CMS. They expect 
that the Webpage is 
usable and 
represents valid 
publication. The 
guest influences the 
features of the 
application and how 
information is 
presented to the user.
Low
They do not 
have a 
noticeable risk 
for the 
application. But 
if the 
application is 
not usable and 
readable for the 
user, it may 
affect the 
popularity of 
the CMS.
Medium
CMS provides a 
platform that helps 
them to access a valid 
and categorized paper.
Medium
Satisfying Guest 
users helps the 
system to be seen 
and get popular 
among researchers.

XYZ 
department 
as product 
owner
To consult with app 
developers to ensure the 
application provides a 
feature that they need.
The product owner will 
provide expertise to the 
developers so that the 
finished product will remain 
ethical and provide valid 
paper to the public.
The system's 
functionality 
described in this 
document was built 
upon the product 
owner's initial 
suggestions.
Further feedback 
may influence 
system features; 
however, all 
feedback will be 
carefully considered 
among all 
stakeholders to 
ensure the best user 
experience.
High
If the product 
owner does not 
support the 
project or is 
satisfied with 
the project's 
result, the 
whole project 
will be shut 
down or at high 
risk.
High
The CMS application 
is designed to satisfy 
the owner's 
requirement and make 
a suitable platform to 
manage, publish, and 
review papers.
High
The owner of the 
product defines
the feature and use￾case of the project.

Human 
resource of 
XYZ 
department
They give a list of referees 
to the systems
They do not have a 
direct impact on the 
system.
High
If they do not 
provide reliable 
referees, the 
validity of 
papers will be 
at risk.
Low
They do not have 
much interest in or 
related benefits from 
this project.
High
They provide data 
for the CSM 
execution system.

future CMS 
admin
CMS admin is the person 
chosen by UAlberta and 
product owner as an 
administrator of the system.
System 
Administrators 
identify any system 
problems, anticipate 
potential issues and 
repair systems and 
software when 
necessary. They 
ensure the security 
and efficiency of IT 
infrastructure. 
Admin influence on 
the service quality 
and reliability of the 
system.
High
If the admin can 
not do his/her 
jobs correctly, 
the system will 
be at high risk.
High
CMS admin will be 
hired by XYZ 
company to monitor 
the CMS system, so
he/she has the interest 
to meet the project 
goals.
High
The system 
administrator seeks 
to ensure that the 
uptime, 
performance, 
resources, and 
security of the 
computers they 
manage meet the 
users' needs without 
exceeding a set 
budget.

Research 
Ethics office
The office at the FGSR that 
defines the rule for the 
ethical aspect of publishing 
paper
They influence the 
rules and criteria that 
each paper should 
have.
low
Since CMS 
doesn't need 
their 
contribution 
and already 
everything is 
ready and 
welcoming on 
their side.
High
They are interested in 
being followed Since 
they take care of 
publishers and 
authors' rights!
High
The rule they define 
and provide help to 
publish valid papers.

Project 
manager
Project managers (PMs) are 
responsible for planning, 
organizing, and directing 
project completion for an 
XYZ company while 
ensuring these projects are 
on time, on budget, and 
within scope. Mahsa is a 
project manager for the 
CMS system.
She has a direct 
influence on the 
developer and the 
features of the 
system.
High
If she can not 
manage 
everything and 
meet the 
deadline, the 
project will 
be at high risk.
High
This project gives her 
a job opportunity
High
She has a 
responsibility to 
lead, organize, and 
meet deadlines.

team 
members 
(developers)
Developers in the CMS 
project are teaching Team
They are responsible for 
implementing and 
developing the project.
The developers are 
internal stakeholders 
in the development
of CMS. They are 
focused on correctly 
implementing as 
many specified 
features as possible. 
Their input and 
expectations are 
directly applicable to 
the app's 
functionality and 
maintainability, 
more so than all 
other stakeholders. It 
is the responsibility 
of developers to 
translate the 
expectations of the 
external stakeholders 
into a functioning 
product. Developers 
influence the 
system's software 
quality greatly 
because they 
implement all 
features in response 
to the expectations 
of the external 
stakeholders (as well 
as their own).
High
Meeting 
deadlines is the 
sole 
responsibility of 
the application 
developers. If 
the developers 
cannot deliver 
the software 
and related 
components by 
the deadline, 
the project risks 
failure.
Many of the 
application 
features in this 
document were 
included with 
the user's needs 
in mind. The 
delivery of 
these promised 
features will 
directly 
influence the 
user's reception 
to the app's 
deployment. 
Not 
implementing 
features will 
negatively 
impact the 
project.
High
This project gives 
them a job 
opportunity
High
Developers are 
crucial to the project 
to meet the goal and 
implement the 
proper features in the 
application.

software 
maintainer
The maintainer is a subset of 
the current developers or 
new developers looking to 
learn. Maintainers expect 
that the project will be 
modular, understandable, 
testable, and overall 
maintainable.
Maintainers are 
external stakeholders 
representing any 
party interested in 
continuing or 
extending CMS's 
development beyond 
its demonstration at 
the end of the term.
The influence and 
power of maintainers 
to the development 
of CMS are 
moderate. Many of 
the expectations of 
the maintainers are 
directly addressed by 
the efforts of the 
current developers. 
Adherence to best 
practices in 
development and 
documentation 
during the 
development effort 
will improve the 
project's overall 
maintainability. 
Delivering a 
functional system 
that satisfies users 
and academic staff is 
considered a higher 
priority than 
ensuring the project 
is easy to 
adopt/maintain in the 
future.
High
Future 
maintainers of 
CMS will 
assume many of 
the same risks 
that the 
developers 
have.
High
The software 
maintainer will be 
hired by the company.
High
Software 
maintenance has 
become an essential 
part of the software's 
development after its 
execution based on 
his/her 
responsibilities.

Publishers The accepted paper will be 
sent to a publisher to publish 
the paper after getting 
permission from the authors.
They do not have a 
direct influence on 
the system.
Low
They do not 
have direct 
influence on a 
system, so They 
do not put a 
system at risk.
High
CMS helps them to 
access valid articles in 
different areas.
Low
Their work does not 
have many benefits 
for the system but
gives the authors an 
opportunity to 
publish their paper.

Copyright 
agency of 
Canada
The Canadian Intellectual 
Property Office (CIPO) is a 
special operating agency of 
Innovation, Science and 
Economic Development 
Canada.
They influence the 
rules and criteria that 
each paper should 
have.
low
Since CMS 
doesn't need 
their 
contribution 
and already 
everything is 
ready and 
welcoming on 
their side.
High
They are interested in 
being followed Since 
they take care of 
publishers and 
authors' rights!
High
The rule they define 
and provide help to 
publish valid papers.
